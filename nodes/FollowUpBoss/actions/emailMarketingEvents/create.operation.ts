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
	wrapCreateSuccess,
	getPersonIdProperty,
	getUserIdProperty,
	getEmailMarketingCampaignIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['emailMarketingEvents'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		...getEmailMarketingCampaignIdProperty(),
		description:
			'ID of the email campaign this event belongs to. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Event Type',
		name: 'eventType',
		type: 'options',
		options: [
			{ name: 'Bounced', value: 'bounced' },
			{ name: 'Click', value: 'click' },
			{ name: 'Delivered', value: 'delivered' },
			{ name: 'Dropped', value: 'dropped' },
			{ name: 'Hard Bounce', value: 'hard-bounce' },
			{ name: 'Open', value: 'open' },
			{ name: 'Soft Bounce', value: 'soft-bounce' },
			{ name: 'Spam Report', value: 'spamreport' },
			{ name: 'Unsubscribe', value: 'unsubscribe' },
		],
		default: 'delivered',
		required: true,
		description: 'Type of email event',
	},
	{
		displayName: 'Recipient Email',
		name: 'recipient',
		type: 'string',
		default: '',
		required: true,
		description: 'Email address of the recipient',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Occurred At',
				name: 'occurred',
				type: 'dateTime',
				default: '',
				description: 'Date/time of the event',
			},
			{
				...getPersonIdProperty(),
				name: 'personId',
				required: false,
				description: 'ID of the recipient. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'URL for the campaign',
			},
			{
				...getUserIdProperty('User', 'userId', false),
				description:
					'Follow Up Boss user ID from whom the email was sent. Choose from the list, or specify an ID.',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const campaignIdRaw = (this.getNodeParameter('campaignId', i) as IDataObject).value as string;
	const campaignId = toInt(campaignIdRaw, 'Campaign ID', this.getNode(), i);
	const eventType = this.getNodeParameter('eventType', i) as string;
	const recipient = this.getNodeParameter('recipient', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

	const eventObject: IDataObject = {
		campaignId,
		type: eventType,
		recipient,
		...additionalFields,
	};

	// Handle personId if provided
	if (additionalFields.personId) {
		const personIdRaw = (additionalFields.personId as IDataObject).value as string;
		eventObject.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	}

	if (additionalFields.userId) {
		const userIdRaw = (additionalFields.userId as IDataObject).value as string;
		eventObject.userId = toInt(userIdRaw, 'User ID', this.getNode(), i);
	}

	const body = {
		emEvents: [eventObject],
	};

	await apiRequest.call(this, 'POST', '/emEvents', body);
	return wrapCreateSuccess();
}
