import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
	IDataObject,
} from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from './transport';
import { getTagsProperty, normalizeTags, wrapData } from './helpers/utils';
import { WEBHOOK_EVENT_OPTIONS } from './constants';
import * as methods from './methods';

export class FollowUpBossHandler implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Follow Up Boss Handler',
		name: 'followUpBossHandler',
		icon: 'file:FollowUpBoss.svg',
		group: ['transform'],
		version: 1,
		subtitle: `={{
			({
				"webhookEvent": "Filter by Webhook Event",
				"peopleStageUpdated": "Filter by Stage",
				"peopleTagsCreated": "Filter by Tags",
				"filterEvents": "Filter by Person Event",
				"hydrate": "Get Full Data"
			})[$parameter["operation"]] || $parameter["operation"]
		}}`,
		description: 'Hydrates and filters Follow Up Boss webhook events',
		documentationUrl:
			'https://github.com/brian-conrya/n8n-nodes-followupboss/blob/main/nodes/FollowUpBoss/FollowUpBossHandler.md',
		defaults: {
			name: 'Follow Up Boss Handler',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'followUpBossApi',
				required: true,
				displayOptions: {
					show: {
						authentication: ['apiKey'],
					},
				},
			},
			{
				name: 'followUpBossOAuth2Api',
				required: true,
				displayOptions: {
					show: {
						authentication: ['oAuth2'],
					},
				},
			},
		],
		properties: [
			{
				displayName: 'Authentication',
				name: 'authentication',
				type: 'options',
				options: [
					{
						name: 'API Key',
						value: 'apiKey',
					},
					{
						name: 'OAuth2',
						value: 'oAuth2',
					},
				],
				default: 'apiKey',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Filter by Person Event', value: 'filterEvents' },
					{ name: 'Filter by Stage Updated', value: 'peopleStageUpdated' },
					{ name: 'Filter by Tags Created', value: 'peopleTagsCreated' },
					{ name: 'Filter by Webhook Event', value: 'webhookEvent' },
					{ name: 'Get Full Data', value: 'hydrate' },
				],
				default: 'hydrate',
				description: 'Select the operation mode. All modes fetch full data from the API.',
			},

			// Filter: Webhook Event
			{
				displayName: 'Filter by Webhook Event',
				name: 'webhookEventFilter',
				type: 'multiOptions',
				default: [],
				options: WEBHOOK_EVENT_OPTIONS,
				description:
					'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: { show: { operation: ['webhookEvent'] } },
			},

			// Filter: Tags Created
			...getTagsProperty('Filter by Tags').map((prop) => ({
				...prop,
				displayOptions: {
					show: {
						...prop.displayOptions?.show,
						operation: ['peopleTagsCreated'],
					},
				},
			})),

			// Filter: Stage Updated
			{
				displayName: 'Filter by Stage',
				name: 'stageFilter',
				type: 'multiOptions',
				default: [],
				typeOptions: {
					loadOptionsMethod: 'getStageNames',
				},
				description:
					'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
				displayOptions: { show: { operation: ['peopleStageUpdated'] } },
			},

			// Filter by Person Event: Event Source
			{
				displayName: 'Event Source',
				name: 'eventSource',
				type: 'string',
				default: '',
				description: 'Enter the top-level source (e.g. Zillow) to match exactly',
				displayOptions: { show: { operation: ['filterEvents'] } },
			},
			// Filter by Person Event: Person IDs
			{
				displayName: 'Person IDs',
				name: 'personIds',
				type: 'string',
				default: '',
				description: 'Comma-separated list of Person IDs to filter by',
				displayOptions: { show: { operation: ['filterEvents'] } },
			},

			// Filter by Person Event: Event Types
			{
				displayName: 'Event Types',
				name: 'eventTypes',
				type: 'multiOptions',
				default: [],
				displayOptions: { show: { operation: ['filterEvents'] } },
				options: [
					{ name: 'General Inquiry', value: 'General Inquiry' },
					{ name: 'Incoming Call', value: 'Incoming Call' },
					{ name: 'Inquiry', value: 'Inquiry' },
					{ name: 'Property Inquiry', value: 'Property Inquiry' },
					{ name: 'Property Search', value: 'Property Search' },
					{ name: 'Registration', value: 'Registration' },
					{ name: 'Saved Property', value: 'Saved Property' },
					{ name: 'Saved Property Search', value: 'Saved Property Search' },
					{ name: 'Seller Inquiry', value: 'Seller Inquiry' },
					{ name: 'Unsubscribed', value: 'Unsubscribed' },
					{ name: 'Viewed Page', value: 'Viewed Page' },
					{ name: 'Viewed Property', value: 'Viewed Property' },
					{ name: 'Visited Open House', value: 'Visited Open House' },
					{ name: 'Visited Website', value: 'Visited Website' },
				],
				description: 'Filter by specific event types. If empty, all types will be processed.',
			},
			{
				displayName: 'Property Filters',
				name: 'propertyFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['filterEvents'] } },
				options: [
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						description: 'Enter the city name to match exactly',
					},
					{
						displayName: 'Max Price',
						name: 'maxPrice',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'Min Price',
						name: 'minPrice',
						type: 'number',
						default: 0,
					},
					{
						displayName: 'MLS Number',
						name: 'mlsNumber',
						type: 'string',
						default: '',
						description: 'Enter the MLS number to match exactly',
					},
					{
						displayName: 'Neighborhood',
						name: 'neighborhood',
						type: 'string',
						default: '',
						description: 'Matches if the neighborhood name contains this text (case-insensitive)',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
						description: 'Enter the state name (e.g. PA) to match exactly',
					},
					{
						displayName: 'Zip Code',
						name: 'zipCode',
						type: 'string',
						default: '',
						description: 'Enter the zip code to match exactly',
					},
				],
			},
			{
				displayName: 'Engagement Filters',
				name: 'engagementFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['filterEvents'] } },
				options: [
					{
						displayName: 'URL',
						name: 'urlContains',
						type: 'string',
						default: '',
						description: 'Matches if the page URL contains this text (case-insensitive)',
					},
					{
						displayName: 'Page Title',
						name: 'titleContains',
						type: 'string',
						default: '',
						description: 'Matches if the page title contains this text (case-insensitive)',
					},
					{
						displayName: 'Message',
						name: 'messageContains',
						type: 'string',
						default: '',
						description:
							'Matches if the message or description contains this text (case-insensitive)',
					},
				],
			},
			{
				displayName: 'Campaign Filters',
				name: 'campaignFilters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: { show: { operation: ['filterEvents'] } },
				options: [
					{
						displayName: 'Campaign Name',
						name: 'campaign',
						type: 'string',
						default: '',
						description: 'Matches if the campaign name contains this text (case-insensitive)',
					},
					{
						displayName: 'Content',
						name: 'content',
						type: 'string',
						default: '',
						description: 'Matches if the campaign content contains this text (case-insensitive)',
					},
					{
						displayName: 'Medium',
						name: 'medium',
						type: 'string',
						default: '',
						description: 'Matches if the campaign medium contains this text (case-insensitive)',
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'string',
						default: '',
						description: 'Matches if the campaign source contains this text (case-insensitive)',
					},
					{
						displayName: 'Term',
						name: 'term',
						type: 'string',
						default: '',
						description: 'Matches if the campaign term contains this text (case-insensitive)',
					},
				],
			},
		],
		usableAsTool: true,
	};

	methods = {
		loadOptions: methods.loadOptions,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const json = item.json;
			const data = (json.data as IDataObject) || {};
			const uri = (json.uri as string) || (data?.uri as string);
			const event = json.event as string;

			// Pre-Hydration Filtering (Checks the webhook payload)
			if (operation === 'filterEvents' && event !== 'eventsCreated') {
				continue;
			}

			if (operation === 'peopleTagsCreated' && (!data.tags || !(data.tags as string[]).length)) {
				continue;
			}

			if (operation === 'peopleStageUpdated' && !data.stage) {
				continue;
			}

			// Operation Filtering (Before Hydration)
			if (operation === 'webhookEvent') {
				const webhookEventFilter = this.getNodeParameter('webhookEventFilter', i, []) as string[];
				if (webhookEventFilter.length > 0 && (!event || !webhookEventFilter.includes(event))) {
					continue;
				}
			}

			if (operation === 'peopleTagsCreated') {
				const tagsMode = this.getNodeParameter('tagsMode', i, 'manual') as string;
				const tags = (data?.tags as string[]) || [];

				let filterTags: string[] = [];
				if (tagsMode === 'manual') {
					const tagsManual = this.getNodeParameter('tagsManual', i, '') as string;
					filterTags = normalizeTags(tagsMode, tagsManual, undefined);
				} else {
					const tagsJson = this.getNodeParameter('tagsJson', i, undefined);
					filterTags = normalizeTags(tagsMode, undefined, tagsJson);
				}

				if (filterTags.length > 0) {
					const hasMatchingTag = tags && tags.some((tag) => filterTags.includes(tag));
					if (!hasMatchingTag) continue;
				}
			}

			if (operation === 'peopleStageUpdated') {
				const stageFilter = this.getNodeParameter('stageFilter', i, []) as string[];
				const stage = data?.stage as string;

				if (stageFilter.length > 0 && (!stage || !stageFilter.includes(stage))) {
					continue;
				}
			}

			// Hydration
			// Uses the passed URI to fetch the full resource state
			if (!uri) {
				continue;
			}

			try {
				const url = new URL(uri);
				const endpoint = url.pathname.replace(/^\/v1/, '');
				const qs = Object.fromEntries(url.searchParams) as IDataObject;

				// Smart Hydration: Use all items for collections, single request for IDs
				// FUB IDs are numeric at the end of the path
				const isSingleResource = /\/\d+$/.test(endpoint);
				let results: IDataObject[] = [];

				if (isSingleResource) {
					results = [await apiRequest.call(this, 'GET', endpoint, {}, qs)];
				} else {
					results = await apiRequestAllItems.call(this, endpoint, qs);
				}

				// Apply Post-Hydration Filter (If enabled)
				if (operation === 'filterEvents') {
					const eventTypes = this.getNodeParameter('eventTypes', i, []) as string[];
					const personIds = this.getNodeParameter('personIds', i, '') as string;
					const eventSource = this.getNodeParameter('eventSource', i, '') as string;
					const propertyFilters = this.getNodeParameter('propertyFilters', i, {}) as IDataObject;
					const engagementFilters = this.getNodeParameter(
						'engagementFilters',
						i,
						{},
					) as IDataObject;
					const campaignFilters = this.getNodeParameter('campaignFilters', i, {}) as IDataObject;

					results = results.filter((item) =>
						applyHydratedFilters(item as IDataObject, {
							eventTypes,
							personIds,
							eventSource,
							propertyFilters,
							engagementFilters,
							campaignFilters,
						}),
					);
				}

				// Output remaining items
				returnData.push(...wrapData(results, i));
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push(...wrapData({ error: (error as Error).message }, i));
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}

function applyHydratedFilters(
	item: IDataObject,
	filters: {
		eventTypes: string[];
		personIds: string;
		eventSource: string;
		propertyFilters: IDataObject;
		engagementFilters: IDataObject;
		campaignFilters: IDataObject;
	},
): boolean {
	// Person IDs Filter
	if (filters.personIds) {
		const allowedIds = filters.personIds.split(',').map((id) => id.trim());
		if (!allowedIds.includes(String(item.personId))) return false;
	}

	// Event Source Filter
	if (filters.eventSource) {
		if (((item.source as string) || '').toLowerCase() !== filters.eventSource.toLowerCase())
			return false;
	}

	// Event Type Filter
	const eventType = item.type as string;
	if (filters.eventTypes.length > 0) {
		if (!filters.eventTypes.includes(eventType)) return false;
	}

	// Property Filters
	const pf = filters.propertyFilters;
	if (pf && Object.keys(pf).length > 0) {
		const prop = (item.property as IDataObject) || {};
		const search = (item.propertySearch as IDataObject) || {};

		if (pf.mlsNumber && prop.mlsNumber !== pf.mlsNumber) return false;
		if (pf.zipCode && prop.code !== pf.zipCode) return false;
		if (
			pf.state &&
			((prop.state as string) || '').toLowerCase() !== (pf.state as string).toLowerCase()
		)
			return false;
		if (
			pf.city &&
			((prop.city as string) || '').toLowerCase() !== (pf.city as string).toLowerCase()
		)
			return false;

		if (pf.neighborhood) {
			const neighborhood = (
				(prop.neighborhood as string) ||
				(search.neighborhood as string) ||
				''
			).toLowerCase();
			if (!neighborhood.includes((pf.neighborhood as string).toLowerCase())) return false;
		}

		const priceRaw = ((prop.price as string) || '').replace(/[^0-9.]/g, '');
		const price = priceRaw ? Number(priceRaw) : 0;
		if (pf.minPrice && (!price || price < (pf.minPrice as number))) return false;
		if (pf.maxPrice && (!price || price > (pf.maxPrice as number))) return false;
	}

	// Engagement Filters
	const ef = filters.engagementFilters;
	if (ef && Object.keys(ef).length > 0) {
		if (ef.urlContains) {
			const url = ((item.pageUrl as string) || '').toLowerCase();
			if (!url.includes((ef.urlContains as string).toLowerCase())) return false;
		}
		if (ef.titleContains) {
			const title = ((item.pageTitle as string) || '').toLowerCase();
			if (!title.includes((ef.titleContains as string).toLowerCase())) return false;
		}
		if (ef.messageContains) {
			const text =
				`${(item.message as string) || ''} ${(item.description as string) || ''}`.toLowerCase();
			if (!text.includes((ef.messageContains as string).toLowerCase())) return false;
		}
	}

	// Campaign Filters
	const cf = filters.campaignFilters;
	if (cf && Object.keys(cf).length > 0) {
		const camp = (item.campaign as IDataObject) || {};
		if (
			cf.source &&
			!((camp.source as string) || '').toLowerCase().includes((cf.source as string).toLowerCase())
		)
			return false;
		if (
			cf.medium &&
			!((camp.medium as string) || '').toLowerCase().includes((cf.medium as string).toLowerCase())
		)
			return false;
		if (
			cf.term &&
			!((camp.term as string) || '').toLowerCase().includes((cf.term as string).toLowerCase())
		)
			return false;
		if (
			cf.content &&
			!((camp.content as string) || '').toLowerCase().includes((cf.content as string).toLowerCase())
		)
			return false;
		if (
			cf.campaign &&
			!((camp.campaign as string) || '')
				.toLowerCase()
				.includes((cf.campaign as string).toLowerCase())
		)
			return false;
	}

	return true;
}
