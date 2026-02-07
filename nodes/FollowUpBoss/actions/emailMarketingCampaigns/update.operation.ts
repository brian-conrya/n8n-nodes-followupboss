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
	getEmailMarketingCampaignIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['emailMarketingCampaigns'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getEmailMarketingCampaignIdProperty(),
		description: 'ID of the campaign to update. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Body HTML',
				name: 'bodyHtml',
				type: 'string',
				typeOptions: {
					editor: 'htmlEditor',
					rows: 5,
				},
				default: '',
				placeholder: "I saw you're browsing our website, how can I help with...",
				description: 'Email body in HTML',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: 'How can I help',
				description: 'Name of the email campaign or template',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				placeholder: 'How can I help?',
				description: 'Email subject line',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const campaignIdRaw = (this.getNodeParameter('campaignId', i) as IDataObject).value as string;
	const campaignId = toInt(campaignIdRaw, 'Campaign ID', this.getNode(), i);
	const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

	const body: IDataObject = { ...updateFields };

	const response = await apiRequest.call(this, 'PUT', `/emCampaigns/${campaignId}`, body);
	return wrapData(response, i);
}
