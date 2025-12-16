import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['users'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'User Name or ID',
		name: 'id',
		type: 'options',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		description:
			'The user to retrieve. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const id = toInt(this.getNodeParameter('id', i) as string, 'ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/users/${id}`);
	return wrapData(response);
}
