import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['stages'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. New Lead',
		description: 'Name of the stage',
	},
	{
		displayName: 'Order Weight',
		name: 'orderWeight',
		type: 'number',
		default: 1000,
		placeholder: 'e.g. 1000',
		description: 'Set this value to enforce a specific sort order',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', i) as string;
	const orderWeight = this.getNodeParameter('orderWeight', i) as number;
	const body = { name, orderWeight };
	const response = await apiRequest.call(this, 'POST', '/stages', body);
	return wrapData(response);
}
