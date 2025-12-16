import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['emailMarketingEvents'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Campaign ID',
		name: 'campaignId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the email campaign this event belongs to',
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
				displayName: 'Person ID',
				name: 'personId',
				type: 'string',
				default: '',
				description: 'ID of the recipient',
			},
			{
				displayName: 'URL',
				name: 'url',
				type: 'string',
				default: '',
				description: 'URL for the campaign',
			},
			{
				displayName: 'User Name or ID',
				name: 'userId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
				},
				default: '',
				description:
					'Follow Up Boss user ID from whom the email was sent. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const campaignIdRaw = this.getNodeParameter('campaignId', i) as string;
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
		eventObject.personId = toInt(additionalFields.personId as string, 'Person ID', this.getNode(), i);
	}

	if (eventObject.userId) {
		eventObject.userId = toInt(eventObject.userId as string, 'User ID', this.getNode(), i);
	}

	const body = {
		emEvents: [eventObject],
	};

	const response = await apiRequest.call(this, 'POST', '/emEvents', body);
	return wrapData(response);
}
