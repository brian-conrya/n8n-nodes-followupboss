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
		resource: ['textMessageTemplates'],
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
		placeholder: 'e.g. Beach House promo',
		description: 'The name of your text message template',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		required: true,
		placeholder:
			'e.g. %greeting_time%, %contact_first_name% Check out this beach house: https://example.com',
		description: 'The body of your text message template',
	},
	{
		displayName: 'Is Shared',
		name: 'isShared',
		type: 'boolean',
		default: true,
		description:
			'Whether this template should be shared with other users in the same Follow Up Boss account',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', i) as string;
	const message = this.getNodeParameter('message', i) as string;
	const isShared = this.getNodeParameter('isShared', i) as boolean;

	const body = {
		name,
		message,
		isShared,
	};

	const response = await apiRequest.call(this, 'POST', '/textMessageTemplates', body);
	return wrapData(response);
}
