import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapDeleteSuccess } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['deals'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Deal Name or ID',
		name: 'dealId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getDeals',
		},
		default: '',
		required: true,
		description: 'The deal to delete. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const dealIdRaw = this.getNodeParameter('dealId', index) as string;
	const dealId = toInt(dealIdRaw, 'Deal ID', this.getNode(), index);
	await apiRequest.call(this, 'DELETE', `/deals/${dealId}`);
	return wrapDeleteSuccess();
}


