import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getPersonIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['pauseActionPlans'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'personId',
	},
	{
		displayName: 'Pause Mode',
		name: 'pauseMode',
		type: 'options',
		options: [
			{
				name: 'All Action Plans',
				value: 'all',
				description: 'Pause all active action plans for this person',
			},
			{
				name: 'Specific Action Plans',
				value: 'specific',
				description: 'Pause only selected action plans',
			},
		],
		default: 'all',
		required: true,
		description: 'Whether to pause all action plans or specific ones',
	},
	{
		displayName: 'Action Plan Names or IDs',
		name: 'actionPlanIds',
		type: 'multiOptions',
		default: [],
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getActionPlans',
		},
		displayOptions: {
			show: {
				pauseMode: ['specific'],
			},
		},
		description:
			'The action plans to pause. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const personIdRaw = this.getNodeParameter('personId', i) as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const pauseMode = this.getNodeParameter('pauseMode', i) as string;

	// Fetch all action plans for this person
	const response = await apiRequest.call(this, 'GET', '/actionPlansPeople', {}, { personId });

	const actionPlansPeople =
		(response.actionPlans as IDataObject[]).length > 0
			? (response.actionPlans as IDataObject[])
			: [];

	// Filter action plans based on mode
	let actionPlansToPause = actionPlansPeople;

	if (pauseMode === 'specific') {
		const actionPlanIds = this.getNodeParameter('actionPlanIds', i) as number[];
		const activePlans = (actionPlansPeople as IDataObject[]).filter(
			(plan: IDataObject) => plan.status === 'Active',
		);
		actionPlansToPause = activePlans.filter((ap: IDataObject) =>
			actionPlanIds.includes(ap.actionPlanId as number),
		);
	}

	// Pause each action plan
	const pausedActionPlans = [];
	for (const actionPlan of actionPlansToPause) {
		// Only pause if the action plan is not already paused or completed
		if (actionPlan.status !== 'Paused' && actionPlan.status !== 'Completed') {
			await apiRequest.call(this, 'PUT', `/actionPlansPeople/${actionPlan.id}`, {
				status: 'Paused',
			});
			pausedActionPlans.push({
				id: actionPlan.id,
				actionPlanName: actionPlan.actionPlanName,
				previousStatus: actionPlan.status,
				newStatus: 'Paused',
			});
		}
	}

	return wrapData(pausedActionPlans);
}
