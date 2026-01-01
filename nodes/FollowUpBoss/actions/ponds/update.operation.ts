import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	toInt,
	updateDisplayOptions,
	wrapData,
	getPondIdProperty,
	getUserIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['ponds'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPondIdProperty(),
		description: 'ID of the pond to update. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the pond',
			},
			{
				...getUserIdProperty('Lead Agent', 'userId', false),
				description:
					'Set this value to change the Pond Lead Agent. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'User Names or IDs',
				name: 'userIds',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
				},
				default: [],
				description:
					'Users to assign to the pond. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const pondIdRaw = (this.getNodeParameter('pondId', i) as IDataObject).value as string;
	const pondId = toInt(pondIdRaw, 'Pond ID', this.getNode(), i);
	const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

	const body: IDataObject = {
		...updateFields,
	};

	if (updateFields.userId) {
		const userIdRaw = (updateFields.userId as IDataObject).value as string;
		body.userId = toInt(userIdRaw, 'User ID', this.getNode(), i);
	}

	const response = await apiRequest.call(this, 'PUT', `/ponds/${pondId}`, body);
	return wrapData(response);
}
