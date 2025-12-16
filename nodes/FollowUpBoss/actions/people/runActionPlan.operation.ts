import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['runActionPlan'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Person ID',
		name: 'personId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the person',
	},
	{
		displayName: 'Action Plan Name or ID',
		name: 'actionPlanId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getActionPlans',
		},
		default: '',
		required: true,
		description:
			'The action plan to run. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const personIdRaw = this.getNodeParameter('personId', i) as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const actionPlanId = toInt(this.getNodeParameter('actionPlanId', i) as string, 'Action Plan ID', this.getNode(), i);

	// Run the action plan for this person
	const body = {
		personId: personId,
		actionPlanId,
	};

	const response = await apiRequest.call(this, 'POST', '/actionPlansPeople', body);
	return wrapData(response);
}
