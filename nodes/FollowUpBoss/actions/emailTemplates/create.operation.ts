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
		resource: ['emailTemplates'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		placeholder: 'Beach House promo',
		required: true,
		description: 'The name of the new email template',
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		default: '',
		placeholder: 'Check out this beach house!',
		required: true,
		description: 'The email subject used when this email template is selected',
	},
	{
		displayName: 'Body HTML',
		name: 'body',
		type: 'string',
		default: '',
		placeholder:
			'%greeting_time%,&nbsp;%contact_first_name%<br><br>Check out this beach house: <a href="https://example.com">https://example.com</a><br><br>',
		required: true,
		description: 'The HTML body of the email template',
		typeOptions: {
			rows: 5,
			editor: 'htmlEditor',
		},
	},
	{
		displayName: 'Is Shared',
		name: 'isShared',
		type: 'boolean',
		default: false,
		description:
			'Whether this email template should be shared with other users in the same Follow Up Boss account',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', i) as string;
	const subject = this.getNodeParameter('subject', i) as string;
	const bodyContent = this.getNodeParameter('body', i) as string;
	const isShared = this.getNodeParameter('isShared', i) as boolean;
	const body = { name, subject, body: bodyContent, isShared };
	const response = await apiRequest.call(this, 'POST', '/templates', body);
	return wrapData(response);
}
