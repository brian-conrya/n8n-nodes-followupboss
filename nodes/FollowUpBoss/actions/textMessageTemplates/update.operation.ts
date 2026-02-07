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
	getTextMessageTemplateIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['textMessageTemplates'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getTextMessageTemplateIdProperty(true, 'id'),
		description: 'ID of the template to update. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'Beach House promo',
		description: 'The name of your text message template',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		required: true,
		placeholder:
			'%greeting_time%, %contact_first_name% Check out this beach house: https://example.com',
		description: 'The body of your text message template',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Is Shared',
				name: 'isShared',
				type: 'boolean',
				default: true,
				description:
					'Whether this template should be shared with other users in the same Follow Up Boss account',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Text Message Template ID', this.getNode(), i);
	const name = this.getNodeParameter('name', i) as string;
	const message = this.getNodeParameter('message', i) as string;
	const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

	const body = {
		name,
		message,
		...updateFields,
	};

	const response = await apiRequest.call(this, 'PUT', `/textMessageTemplates/${id}`, body);
	return wrapData(response, i);
}
