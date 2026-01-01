import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../transport';
import { toInt, updateDisplayOptions, getPersonIdProperty } from '../../helpers/utils';

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

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const pauseMode = this.getNodeParameter('pauseMode', i) as string;

	// Fetch all action plans for this person
	const actionPlansPeople = await apiRequestAllItems.call(this, '/actionPlansPeople', { personId });

	// Filter action plans based on mode
	let actionPlansToPause = actionPlansPeople;

	if (pauseMode === 'specific') {
		const actionPlanIds = this.getNodeParameter('actionPlanIds', i) as number[];
		const runningPlans = (actionPlansPeople as IDataObject[]).filter(
			(plan: IDataObject) => plan.status === 'Running',
		);
		actionPlansToPause = runningPlans.filter((ap: IDataObject) =>
			actionPlanIds.includes(ap.actionPlanId as number),
		);
	}

	// Pause each action plan
	for (const actionPlan of actionPlansToPause) {
		// Only pause if the action plan is running
		if (actionPlan.status === 'Running') {
			await apiRequest.call(this, 'PUT', `/actionPlansPeople/${actionPlan.id}`, {
				status: 'Paused',
			});
		}
	}

	return [{ json: { paused: true } }];
}
