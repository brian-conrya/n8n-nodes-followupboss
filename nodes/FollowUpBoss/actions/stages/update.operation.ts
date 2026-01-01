import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getStageIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['stages'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getStageIdProperty(true, 'id', true),
		description: 'ID of the stage to update. Choose from the list, or specify an ID.',
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

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Stage ID', this.getNode(), i);
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
