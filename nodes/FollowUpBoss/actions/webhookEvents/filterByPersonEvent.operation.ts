import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { updateDisplayOptions, wrapData } from '../../helpers/utils';
import { getWebhookPayload, hydrateFromUri } from './shared';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhookEvents'],
		operation: ['filterByPersonEvent'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Event Source',
		name: 'eventSource',
		type: 'string',
		default: '',
		description: 'Enter the top-level source (e.g. Zillow) to match exactly',
	},
	{
		displayName: 'Person IDs',
		name: 'personIds',
		type: 'string',
		default: '',
		description: 'Comma-separated list of Person IDs to filter by',
	},
	{
		displayName: 'Event Types',
		name: 'eventTypes',
		type: 'multiOptions',
		default: [],
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
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const { event, uri } = getWebhookPayload.call(this, i);

	if (event !== 'eventsCreated') return [];

	let results = await hydrateFromUri.call(this, uri);

	const eventTypes = this.getNodeParameter('eventTypes', i, []) as string[];
	const personIds = this.getNodeParameter('personIds', i, '') as string;
	const eventSource = this.getNodeParameter('eventSource', i, '') as string;
	const propertyFilters = this.getNodeParameter('propertyFilters', i, {}) as IDataObject;
	const engagementFilters = this.getNodeParameter('engagementFilters', i, {}) as IDataObject;
	const campaignFilters = this.getNodeParameter('campaignFilters', i, {}) as IDataObject;

	results = results.filter((item) =>
		applyHydratedFilters(item, {
			eventTypes,
			personIds,
			eventSource,
			propertyFilters,
			engagementFilters,
			campaignFilters,
		}),
	);

	return wrapData(results, i);
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
	if (filters.personIds) {
		const allowedIds = filters.personIds.split(',').map((id) => id.trim());
		if (!allowedIds.includes(String(item.personId))) return false;
	}

	if (filters.eventSource) {
		if (((item.source as string) || '').toLowerCase() !== filters.eventSource.toLowerCase())
			return false;
	}

	const eventType = item.type as string;
	if (filters.eventTypes.length > 0) {
		if (!filters.eventTypes.includes(eventType)) return false;
	}

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
