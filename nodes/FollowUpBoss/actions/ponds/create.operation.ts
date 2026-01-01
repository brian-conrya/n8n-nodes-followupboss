import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getUserIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['ponds'],
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
		placeholder: 'e.g. My Pond',
		description: 'Name of the pond',
	},
	{
		...getUserIdProperty('Lead Agent', 'userId', true),
		description: 'The Pond Lead Agent. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'User Names or IDs',
		name: 'userIds',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		default: [],
		required: true,
		description:
			'Users to add as members of the pond. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', i) as string;
	const userIdRaw = (this.getNodeParameter('userId', i) as IDataObject).value as string;
	const userId = toInt(userIdRaw, 'User ID', this.getNode(), i);
	const userIds = this.getNodeParameter('userIds', i) as number[];

	const body: IDataObject = {
		name,
		userId,
		userIds,
	};

	const response = await apiRequest.call(this, 'POST', '/ponds', body);
	return wrapData(response);
}
