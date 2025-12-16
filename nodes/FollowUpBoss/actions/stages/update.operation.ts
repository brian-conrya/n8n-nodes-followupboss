import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['stages'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Stage Name or ID',
		name: 'id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getStages',
		},
		default: '',
		required: true,
		description:
			'ID of the stage to update. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		description: 'Name of the stage',
	},
	{
		displayName: 'Order Weight',
		name: 'orderWeight',
		type: 'number',
		default: 1000,
		description: 'Set this value to enforce a specific sort order',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const id = this.getNodeParameter('id', i) as string;
	const name = this.getNodeParameter('name', i) as string;
	const orderWeight = this.getNodeParameter('orderWeight', i) as number;
	const body: IDataObject = {};
	if (name) {
		body.name = name;
	}
	if (orderWeight !== 1000) {
		body.orderWeight = orderWeight;
	}
	const response = await apiRequest.call(this, 'PUT', `/stages/${id}`, body);
	return wrapData(response);
}
