import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { updateDisplayOptions } from '../../helpers/utils';
import { WEBHOOK_EVENT_OPTIONS } from '../../constants';
import { getWebhookPayload, hydrateAndWrap } from './shared';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhookEvents'],
		operation: ['filterByWebhookEvent'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Filter by Webhook Event',
		name: 'webhookEventFilter',
		type: 'multiOptions',
		default: [],
		options: WEBHOOK_EVENT_OPTIONS,
		description:
			'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const { event, uri } = getWebhookPayload.call(this, i);
	const webhookEventFilter = this.getNodeParameter('webhookEventFilter', i, []) as string[];

	if (webhookEventFilter.length > 0 && (!event || !webhookEventFilter.includes(event))) {
		return [];
	}

	return hydrateAndWrap.call(this, uri, i);
}
