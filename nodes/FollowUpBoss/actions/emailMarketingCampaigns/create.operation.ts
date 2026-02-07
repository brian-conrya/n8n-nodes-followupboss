import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['emailMarketingCampaigns'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Origin',
		name: 'origin',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'Curaytor',
		description: 'Name of the email marketing system where this campaign originated from',
	},
	{
		displayName: 'Origin ID',
		name: 'originId',
		type: 'string',
		default: '',
		required: true,
		placeholder: '912',
		description: 'Internal ID of the new campaign or email in the origin system',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'Can I help',
		description: 'Name of the email campaign or template',
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		default: '',
		placeholder: 'Can I help?',
		description: 'Email subject line',
	},
	{
		displayName: 'Body HTML',
		name: 'bodyHtml',
		type: 'string',
		typeOptions: {
			editor: 'htmlEditor',
			rows: 5,
		},
		default: '',
		placeholder: "I saw you're browsing our website, can I help with...",
		description: 'Email body in HTML',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const origin = this.getNodeParameter('origin', i, '') as string;
	const originId = this.getNodeParameter('originId', i, '') as string;
	const name = this.getNodeParameter('name', i, '') as string;
	const subject = this.getNodeParameter('subject', i, '') as string;
	const bodyHtml = this.getNodeParameter('bodyHtml', i, '') as string;

	const body: IDataObject = {
		origin,
		originId,
		name,
		subject,
		bodyHtml,
	};

	// Helper to clean object
	const cleanObject = (obj: IDataObject) => {
		Object.keys(obj).forEach((key) => {
			if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
				delete obj[key];
			}
		});
		return obj;
	};

	cleanObject(body);

	const response = await apiRequest.call(this, 'POST', '/emCampaigns', body);
	return wrapData(response, i);
}
