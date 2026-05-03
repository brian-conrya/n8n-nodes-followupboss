import { INodeProperties } from 'n8n-workflow';

import * as filterByPersonEvent from './filterByPersonEvent.operation';
import * as filterByStageUpdated from './filterByStageUpdated.operation';
import * as filterByTagsCreated from './filterByTagsCreated.operation';
import * as filterByWebhookEvent from './filterByWebhookEvent.operation';
import * as getFullData from './getFullData.operation';

export {
	filterByPersonEvent,
	filterByStageUpdated,
	filterByTagsCreated,
	filterByWebhookEvent,
	getFullData,
};

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhookEvents'],
			},
		},
		options: [
			{
				name: 'Filter by Person Event',
				value: 'filterByPersonEvent',
				description: 'Filter Events Created webhooks by source, person, property, and more',
				action: 'Filter by person event',
			},
			{
				name: 'Filter by Stage Updated',
				value: 'filterByStageUpdated',
				description: 'Filter People Stage Updated webhooks by which stage was set',
				action: 'Filter by stage updated',
			},
			{
				name: 'Filter by Tags Created',
				value: 'filterByTagsCreated',
				description: 'Filter People Tags Created webhooks by which tags were added',
				action: 'Filter by tags created',
			},
			{
				name: 'Filter by Webhook Event',
				value: 'filterByWebhookEvent',
				description: 'Filter incoming events by webhook event type',
				action: 'Filter by webhook event',
			},
			{
				name: 'Get Full Data',
				value: 'getFullData',
				description: 'Hydrate the full resource for any webhook event without filtering',
				action: 'Get full data',
			},
		],
		default: 'getFullData',
	},
	...filterByPersonEvent.description,
	...filterByStageUpdated.description,
	...filterByTagsCreated.description,
	...filterByWebhookEvent.description,
	...getFullData.description,
];
