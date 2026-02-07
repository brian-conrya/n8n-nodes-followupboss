import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
	IDisplayOptions,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	toFloat,
	toInt,
	updateDisplayOptions,
	wrapData,
	getLenderIdProperty,
	getUserIdProperty,
	getPersonIdProperty,
	getCustomFieldNameProperty,
	getTagsProperty,
	normalizeTags,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['events'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Event Type',
		name: 'type',
		type: 'options',
		required: true,
		options: [
			{
				name: 'General Event',
				value: 'general',
			},
			{
				name: 'General Inquiry',
				value: 'General Inquiry',
			},
			{
				name: 'Incoming Call',
				value: 'Incoming Call',
			},
			{
				name: 'Inquiry',
				value: 'inquiry',
			},
			{
				name: 'Property Inquiry',
				value: 'Property Inquiry',
			},
			{
				name: 'Property Search',
				value: 'Property Search',
			},
			{
				name: 'Registration',
				value: 'registration',
			},
			{
				name: 'Saved Property',
				value: 'savedProperty',
			},
			{
				name: 'Saved Property Search',
				value: 'Saved Property Search',
			},
			{
				name: 'Seller Inquiry',
				value: 'Seller Inquiry',
			},
			{
				name: 'Unsubscribed',
				value: 'Unsubscribed',
			},
			{
				name: 'Viewed Page',
				value: 'Viewed Page',
			},
			{
				name: 'Viewed Property',
				value: 'viewedProperty',
			},
			{
				name: 'Visited Open House',
				value: 'Visited Open House',
			},
			{
				name: 'Website Visit',
				value: 'pageView',
			},
		],
		default: 'registration',
		description: 'The type of event to create',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		default: '',
		placeholder: 'I am interested in 6825 Mulholland Dr, ...',
		description: 'A message from the user about this inquiry',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		placeholder: 'Move-in: 12/28/2013',
		description: 'Any additional information about this inquiry',
	},
	{
		displayName: 'Source',
		name: 'source',
		type: 'string',
		default: '',
		placeholder: 'Zillow',
		description: 'The name of the lead source',
	},
	{
		displayName: 'System',
		name: 'system',
		type: 'string',
		default: '',
		placeholder: 'Zillow',
		description: 'The name of the system used in providing leads',
	},
	{
		displayName: 'Page Title',
		name: 'pageTitle',
		type: 'string',
		displayOptions: {
			show: {
				type: ['Viewed Page'],
			},
		},
		default: '',
		placeholder: 'Contact Us',
		description: 'The title of the page viewed (for Viewed Page events)',
	},
	{
		displayName: 'Page URL',
		name: 'pageUrl',
		type: 'string',
		displayOptions: {
			show: {
				type: ['Viewed Page'],
			},
		},
		default: '',
		placeholder: 'http://www.samplerealestate.com/contact-us',
		description: 'The URL of the page viewed (for Viewed Page events)',
	},
	{
		displayName: 'Page Referrer',
		name: 'pageReferrer',
		type: 'string',
		displayOptions: {
			show: {
				type: ['Viewed Page'],
			},
		},
		default: '',
		placeholder: 'https://www.google.com',
		description: 'The referrer URL where the visitor came from (for Viewed Page events)',
	},
	{
		displayName: 'Page Duration',
		name: 'pageDuration',
		type: 'string',
		displayOptions: {
			show: {
				type: ['Viewed Page'],
			},
		},
		default: '',
		description: 'The duration in seconds the visitor spent on the page (for Viewed Page events)',
	},
	{
		displayName: 'Occurred At',
		name: 'occurredAt',
		type: 'dateTime',
		default: '',
		description: 'The date this event occurred',
	},
	{
		displayName: 'Person',
		name: 'person',
		type: 'fixedCollection',
		placeholder: 'Add Person Details',
		default: {},
		options: [
			{
				displayName: 'Person Details',
				name: 'personDetails',
				// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
				values: [
					{
						...getPersonIdProperty(false, 'id'),
						displayName: 'ID',
						description:
							'The ID of the person the event corresponds to. Choose from the list, or specify an ID.',
					},
					{
						displayName: 'First Name',
						name: 'firstName',
						type: 'string',
						default: '',
						placeholder: 'Melissa',
					},
					{
						displayName: 'Last Name',
						name: 'lastName',
						type: 'string',
						default: '',
						placeholder: 'Hartman',
					},
					{
						displayName: 'Emails',
						name: 'emails',
						type: 'fixedCollection',
						default: {},
						placeholder: 'Add Email',
						options: [
							{
								displayName: 'Email',
								name: 'email',
								values: [
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										placeholder: 'm.hartman@example.com',
									},
									{
										displayName: 'Type',
										name: 'type',
										type: 'string',
										default: '',
										placeholder: 'home',
									},
								],
							},
						],
					},
					{
						displayName: 'Phones',
						name: 'phones',
						type: 'fixedCollection',
						default: {},
						placeholder: 'Add Phone',
						options: [
							{
								displayName: 'Phone',
								name: 'phone',
								values: [
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
										placeholder: '(555) 555-1234',
									},
									{
										displayName: 'Type',
										name: 'type',
										type: 'string',
										default: '',
										placeholder: 'mobile',
									},
								],
							},
						],
					},
					{
						displayName: 'Stage',
						name: 'stage',
						type: 'string',
						default: '',
						placeholder: 'Lead',
						description:
							'The stage of the person. (e.g., Lead or Trash See stages API endpoint for more options.).',
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'string',
						default: '',
						placeholder: 'Zillow',
						description: 'The source of the lead',
					},
					{
						displayName: 'Source URL',
						name: 'sourceUrl',
						type: 'string',
						default: '',
						placeholder: 'http://click.email.zillow.com/?qs=1e120cec11e3',
					},
					{
						displayName: 'Price',
						name: 'price',
						type: 'string',
						default: '',
						placeholder: '250000',
						description: 'The estimated sell/buy price for this person',
					},
					{
						displayName: 'Addresses',
						name: 'addresses',
						type: 'fixedCollection',
						default: {},
						placeholder: 'Add Address',
						options: [
							{
								displayName: 'Address',
								name: 'address',
								values: [
									{
										displayName: 'Street',
										name: 'street',
										type: 'string',
										default: '',
										placeholder: '3595 South Higuera St., Suite B',
									},
									{
										displayName: 'City',
										name: 'city',
										type: 'string',
										default: '',
										placeholder: 'San Luis Obispo',
									},
									{
										displayName: 'State',
										name: 'state',
										type: 'string',
										default: '',
										placeholder: 'CA',
									},
									{
										displayName: 'Zip Code',
										name: 'code',
										type: 'string',
										default: '',
										placeholder: '93401',
									},
									{
										displayName: 'Country',
										name: 'country',
										type: 'string',
										default: '',
										placeholder: 'United States',
									},
									{
										displayName: 'Type',
										name: 'type',
										type: 'string',
										default: '',
										placeholder: 'home',
									},
								],
							},
						],
					},
					...getTagsProperty(),
					{
						displayName: 'Assigned Agent Name',
						name: 'assignedTo',
						type: 'string',
						default: '',
						description: 'Full name of the agent to assign to this person',
					},
					{
						...getUserIdProperty('Assigned User Name or ID', 'assignedUserId', false),
						description: 'Agent assigned to this person. Choose from the list, or specify an ID.',
					},
					{
						displayName: 'Assigned Lender Name',
						name: 'assignedLenderName',
						type: 'string',
						default: '',
					},
					{
						...getLenderIdProperty('Assigned Lender Name or ID', 'assignedLenderId', false),
						description: 'Lender assigned to this person. Choose from the list, or specify an ID.',
					},
					{
						displayName: 'Contacted',
						name: 'contacted',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'Custom Fields',
						name: 'customFields',
						type: 'fixedCollection',
						default: {},
						placeholder: 'Add Custom Field',
						options: [
							{
								displayName: 'Custom Field',
								name: 'customField',
								values: [
									getCustomFieldNameProperty(),
									{
										displayName: 'Value',
										name: 'value',
										type: 'string',
										default: '',
									},
								],
							},
						],
					},
				],
			},
		],
	},
	{
		displayName: 'Property',
		name: 'property',
		type: 'fixedCollection',
		placeholder: 'Add Property Details',
		default: {},
		options: [
			{
				displayName: 'Property Details',
				name: 'propertyDetails',
				// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
				values: [
					{
						displayName: 'Street',
						name: 'street',
						type: 'string',
						default: '',
						placeholder: '6825 Mulholland Dr',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						placeholder: 'Los Angeles',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
						placeholder: 'CA',
					},
					{
						displayName: 'Zip Code',
						name: 'code',
						type: 'string',
						default: '',
						placeholder: '90068',
					},
					{
						displayName: 'MLS Number',
						name: 'mlsNumber',
						type: 'string',
						default: '',
						placeholder: '14729339',
					},
					{
						displayName: 'Price',
						name: 'price',
						type: 'string',
						default: '',
						placeholder: '310000',
					},
					{
						displayName: 'Bedrooms',
						name: 'bedrooms',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Bathrooms',
						name: 'bathrooms',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Area',
						name: 'area',
						type: 'string',
						default: '',
						description: 'Square feet',
					},
					{
						displayName: 'Lot',
						name: 'lot',
						type: 'string',
						default: '',
						description: 'Acres',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'string',
						default: '',
						placeholder: 'Apartment',
						description: 'E.g. Bungalow or Apartment.',
					},
					{
						displayName: 'For Rent',
						name: 'forRent',
						type: 'boolean',
						default: false,
					},
					{
						displayName: 'URL',
						name: 'url',
						type: 'string',
						default: '',
						placeholder:
							'http://www.zillow.com/homedetails/6825-Mulholland-Dr-Los-Angeles-CA-90068/2109065822_zpid/',
					},
				],
			},
		],
	},
	{
		displayName: 'Property Search',
		name: 'propertySearch',
		type: 'fixedCollection',
		placeholder: 'Add Property Search Details',
		default: {},
		options: [
			{
				displayName: 'Search Details',
				name: 'searchDetails',
				// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
				values: [
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						placeholder: 'Los Angeles',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
						placeholder: 'CA',
					},
					{
						displayName: 'Zip Code',
						name: 'code',
						type: 'string',
						default: '',
						placeholder: '90068,90210',
						description: 'A single zip code or a comma-separated list of zip codes',
					},
					{
						displayName: 'Neighborhood',
						name: 'neighborhood',
						type: 'string',
						default: '',
						placeholder: 'Cahuenga Pass',
					},
					{
						displayName: 'Min Price',
						name: 'minPrice',
						type: 'string',
						default: '',
						placeholder: '100000',
					},
					{
						displayName: 'Max Price',
						name: 'maxPrice',
						type: 'string',
						default: '',
						placeholder: '500000',
					},
					{
						displayName: 'Min Bedrooms',
						name: 'minBedrooms',
						type: 'string',
						default: '',
						placeholder: '2',
					},
					{
						displayName: 'Max Bedrooms',
						name: 'maxBedrooms',
						type: 'string',
						default: '',
						placeholder: '4',
					},
					{
						displayName: 'Min Bathrooms',
						name: 'minBathrooms',
						type: 'string',
						default: '',
						placeholder: '1',
					},
					{
						displayName: 'Max Bathrooms',
						name: 'maxBathrooms',
						type: 'string',
						default: '',
						placeholder: '3',
					},
					{
						displayName: 'Type',
						name: 'type',
						type: 'string',
						default: '',
						placeholder: 'Residential',
						description: 'E.g. Residential, Lot, Apartment.',
					},
				],
			},
		],
	},
	{
		displayName: 'Campaign',
		name: 'campaign',
		type: 'fixedCollection',
		placeholder: 'Add Campaign Details',
		default: {},
		options: [
			{
				displayName: 'Campaign Details',
				name: 'campaignDetails',
				// eslint-disable-next-line n8n-nodes-base/node-param-fixed-collection-type-unsorted-items
				values: [
					{
						displayName: 'Campaign',
						name: 'campaign',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Source',
						name: 'source',
						type: 'string',
						default: '',
						placeholder: 'Zillow',
					},
					{
						displayName: 'Medium',
						name: 'medium',
						type: 'string',
						default: '',
						placeholder: 'organic',
					},
					{
						displayName: 'Term',
						name: 'term',
						type: 'string',
						default: '',
						placeholder: 'Cahuenga Pass land',
					},
					{
						displayName: 'Content',
						name: 'content',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Page Title',
						name: 'pageTitle',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Page URL',
						name: 'pageUrl',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Page Referrer',
						name: 'pageReferrer',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Page Duration',
						name: 'pageDuration',
						type: 'string',
						default: '',
					},
				],
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const type = this.getNodeParameter('type', i) as string;
	const message = this.getNodeParameter('message', i) as string;
	const description = this.getNodeParameter('description', i) as string;
	const source = this.getNodeParameter('source', i) as string;
	const system = this.getNodeParameter('system', i) as string;
	const occurredAt = this.getNodeParameter('occurredAt', i) as string;

	// Page view fields (only visible for Viewed Page type)
	let pageTitle = '';
	let pageUrl = '';
	let pageReferrer = '';
	let pageDuration: number | null = null;
	if (type === 'Viewed Page') {
		pageTitle = this.getNodeParameter('pageTitle', i, '') as string;
		pageUrl = this.getNodeParameter('pageUrl', i, '') as string;
		pageReferrer = this.getNodeParameter('pageReferrer', i, '') as string;
		pageDuration =
			toFloat(
				this.getNodeParameter('pageDuration', i, '') as string,
				'Page Duration',
				this.getNode(),
				i,
			) || null;
	}

	const person = this.getNodeParameter('person', i) as IDataObject;
	const property = this.getNodeParameter('property', i) as IDataObject;
	const propertySearch = this.getNodeParameter('propertySearch', i) as IDataObject;
	const campaign = this.getNodeParameter('campaign', i) as IDataObject;

	const body: IDataObject = {
		type,
		message,
		description,
		source,
		system,
	};

	// Add page view fields if present
	if (pageTitle) body.pageTitle = pageTitle;
	if (pageUrl) body.pageUrl = pageUrl;
	if (pageReferrer) body.pageReferrer = pageReferrer;
	if (pageDuration !== null) body.pageDuration = pageDuration;

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

	if (occurredAt) {
		body.occurredAt = occurredAt;
	}

	if (person && person.personDetails) {
		const personDetails = person.personDetails as IDataObject;
		const personObject: IDataObject = { ...personDetails };

		if (personObject.assignedLenderId) {
			const assignedLenderIdRaw = (personObject.assignedLenderId as IDataObject).value as string;
			if (assignedLenderIdRaw) {
				personObject.assignedLenderId = toInt(
					assignedLenderIdRaw,
					'Assigned Lender ID',
					this.getNode(),
					i,
				);
			} else {
				delete personObject.assignedLenderId;
			}
		}

		if (personObject.assignedUserId) {
			const assignedUserIdRaw = (personObject.assignedUserId as IDataObject).value as string;
			if (assignedUserIdRaw) {
				personObject.assignedUserId = toInt(
					assignedUserIdRaw,
					'Assigned User ID',
					this.getNode(),
					i,
				);
			} else {
				delete personObject.assignedUserId;
			}
		}

		if (personObject.id) {
			const personIdRaw = (personObject.id as IDataObject).value as string;
			if (personIdRaw) {
				personObject.id = toInt(personIdRaw, 'ID', this.getNode(), i);
			} else {
				delete personObject.id;
			}
		}

		if (personDetails.emails) {
			const emails = personDetails.emails as IDataObject;
			if (emails.email) {
				personObject.emails = (emails.email as IDataObject[]).map((email) => cleanObject(email));
			}
		}

		if (personDetails.phones) {
			const phones = personDetails.phones as IDataObject;
			if (phones.phone) {
				personObject.phones = (phones.phone as IDataObject[]).map((phone) => cleanObject(phone));
			}
		}

		if (personDetails.addresses) {
			const addresses = personDetails.addresses as IDataObject;
			if (addresses.address) {
				personObject.addresses = (addresses.address as IDataObject[]).map((address) =>
					cleanObject(address),
				);
			}
		}

		const tagsMode = this.getNodeParameter('person.personDetails.tagsMode', i, 'manual') as string;
		let tags: string[] = [];
		if (tagsMode === 'manual') {
			const tagsManual = this.getNodeParameter('person.personDetails.tagsManual', i, '') as string;
			tags = normalizeTags(tagsMode, tagsManual, undefined);
		} else {
			const tagsJson = this.getNodeParameter('person.personDetails.tagsJson', i, undefined);
			tags = normalizeTags(tagsMode, undefined, tagsJson);
		}
		if (tags.length > 0) {
			personObject.tags = tags;
		}
		if (personDetails.customFields) {
			const customFields = personDetails.customFields as IDataObject;
			if (customFields.customField) {
				(customFields.customField as IDataObject[]).forEach((field) => {
					if (field.name) {
						const fieldNameRaw = (field.name as IDataObject).value as string;
						if (fieldNameRaw) {
							personObject[fieldNameRaw] = field.value;
						}
					}
				});
			}
		}
		delete personObject.customFields;

		if (personObject.price) {
			personObject.price = toFloat(personObject.price as string, 'Price', this.getNode(), i);
		}

		cleanObject(personObject);
		if (Object.keys(personObject).length > 0) {
			body.person = personObject;
		}
	}

	if (property && property.propertyDetails) {
		const propertyObject = { ...(property.propertyDetails as IDataObject) } as IDataObject;
		if (propertyObject.price) {
			propertyObject.price = toFloat(propertyObject.price as string, 'Price', this.getNode(), i);
		}
		cleanObject(propertyObject);
		if (Object.keys(propertyObject).length > 0) {
			body.property = propertyObject;
		}
	}

	if (propertySearch && propertySearch.searchDetails) {
		const searchObject = { ...(propertySearch.searchDetails as IDataObject) } as IDataObject;
		const searchFields = [
			'maxBathrooms',
			'maxBedrooms',
			'maxPrice',
			'minBathrooms',
			'minBedrooms',
			'minPrice',
		];
		searchFields.forEach((field) => {
			if (searchObject[field]) {
				searchObject[field] = toFloat(searchObject[field] as string, field, this.getNode(), i);
			}
		});

		if (searchObject.code) {
			searchObject.code = (searchObject.code as string).split(',').map((code) => code.trim());
		}

		cleanObject(searchObject);
		if (Object.keys(searchObject).length > 0) {
			body.propertySearch = searchObject;
		}
	}

	if (campaign && campaign.campaignDetails) {
		const campaignObject = { ...(campaign.campaignDetails as IDataObject) } as IDataObject;
		if (campaignObject.pageDuration) {
			campaignObject.pageDuration = toFloat(
				campaignObject.pageDuration as string,
				'Page Duration',
				this.getNode(),
				i,
			);
		}
		cleanObject(campaignObject);
		if (Object.keys(campaignObject).length > 0) {
			body.campaign = campaignObject;
		}
	}

	const response = await apiRequest.call(this, 'POST', '/events', body);
	return wrapData(response, i);
}
