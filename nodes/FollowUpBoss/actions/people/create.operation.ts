import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { updateDisplayOptions, wrapData, toFloat } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		default: '',
		placeholder: 'e.g. Nathan',
		description: 'The first name of the person',
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		default: '',
		placeholder: 'e.g. Smith',
		description: 'The last name of the person',
	},
	{
		displayName: 'Stage Name or ID',
		name: 'stage',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getStages',
		},
		default: '',
		description:
			'The stage the person is in. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Source',
		name: 'source',
		type: 'string',
		default: '',
		placeholder: 'e.g. Zillow',
		description: 'The lead source for the person',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Addresses',
				name: 'addressesUi',
				placeholder: 'Add Address',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'addressesValues',
						displayName: 'Address',
						values: [
							{
								displayName: 'Type',
								name: 'type',
								type: 'options',
								options: [
									{ name: 'Home', value: 'home' },
									{ name: 'Investment', value: 'investment' },
									{ name: 'Mailing', value: 'mailing' },
									{ name: 'Other', value: 'other' },
									{ name: 'Work', value: 'work' },
								],
								default: 'home',
							},
							{
								displayName: 'Street',
								name: 'street',
								type: 'string',
								default: '',
								placeholder: 'e.g. 123 Main St',
							},
							{
								displayName: 'City',
								name: 'city',
								type: 'string',
								default: '',
								placeholder: 'e.g. San Francisco',
							},
							{
								displayName: 'State',
								name: 'state',
								type: 'string',
								default: '',
								placeholder: 'e.g. CA',
							},
							{
								displayName: 'Zip Code',
								name: 'code',
								type: 'string',
								default: '',
								placeholder: 'e.g. 94105',
							},
							{
								displayName: 'Country',
								name: 'country',
								type: 'string',
								default: '',
								placeholder: 'e.g. USA',
							},
						],
					},
				],
			},
			{
				displayName: 'Assigned Lender Name or ID',
				name: 'assignedLenderId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getLenders',
				},
				default: '',
				description:
					'Lender assigned to this person. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Assigned Pond Name or ID',
				name: 'assignedPondId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getPonds',
				},
				default: '',
				description:
					'Pond assigned to this person. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Assigned User Name or ID',
				name: 'assignedUserId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
				},
				default: '',
				description:
					'Agent assigned to this person. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Background',
				name: 'background',
				type: 'string',
				default: '',
				placeholder: 'e.g. Met at open house',
				description: 'Background information on the person',
			},
			{
				displayName: 'Collaborator Names or IDs',
				name: 'collaborators',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
				},
				default: [],
				description:
					'List of user IDs to set as collaborators. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
			{
				displayName: 'Contacted',
				name: 'contacted',
				type: 'boolean',
				default: false,
				description: 'Whether the person has been contacted or not',
			},
			{
				displayName: 'Created At',
				name: 'createdAt',
				type: 'dateTime',
				default: '',
				description: 'Set the creation time for the person, if wanting to create historical leads',
			},
			{
				displayName: 'Custom Fields',
				name: 'customFieldsUi',
				placeholder: 'Add Custom Field',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				options: [
					{
						name: 'customFieldsValues',
						displayName: 'Custom Field',
						values: [
							{
								// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
								displayName: 'Field Label or Name',
								name: 'key',
								type: 'options',
								typeOptions: {
									loadOptionsMethod: 'getCustomFields',
								},
								default: '',
								description:
									'Name of the custom field (with or without "custom" prefix). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the custom field',
								placeholder: 'e.g. Custom Value',
							},
						],
					},
				],
			},
			{
				displayName: 'Deduplicate',
				name: 'deduplicate',
				type: 'boolean',
				default: false,
				description: 'Whether to check for duplicates before creating',
			},
			{
				displayName: 'Emails',
				name: 'emailsUi',
				placeholder: 'Add Email',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'emailsValues',
						displayName: 'Email',
						values: [
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								required: true,
								placeholder: 'e.g. nathan@example.com',
								description: 'Email address',
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'string',
								default: 'home',
							},
							{
								displayName: 'Is Primary',
								name: 'isPrimary',
								type: 'boolean',
								default: false,
							},
						],
					},
				],
			},
			{
				displayName: 'Phones',
				name: 'phonesUi',
				placeholder: 'Add Phone',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'phonesValues',
						displayName: 'Phone',
						values: [
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								required: true,
								placeholder: 'e.g. 555-555-5555',
								description: 'Phone number',
							},
							{
								displayName: 'Type',
								name: 'type',
								type: 'string',
								default: 'mobile',
							},
							{
								displayName: 'Is Primary',
								name: 'isPrimary',
								type: 'boolean',
								default: false,
							},
						],
					},
				],
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'string',
				default: '',
				placeholder: 'e.g. 500000',
				description: 'Price of the property',
			},
			{
				displayName: 'Source URL',
				name: 'sourceUrl',
				type: 'string',
				default: '',
				placeholder: 'e.g. https://example.com/lead',
				description: 'Direct link to the information about a person at the lead provider',
			},
			{
				displayName: 'Tags',
				name: 'tagsUi',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Tag',
				description: 'Tags to add to the person',
				options: [
					{
						displayName: 'Tag',
						name: 'tagsValues',
						values: [
							{
								displayName: 'Tag',
								name: 'tag',
								type: 'string',
								default: '',
								placeholder: 'e.g. Buyer',
								description: 'Tag name',
							},
						],
					},
				],
			},
			{
				displayName: 'Timeframe Name or ID',
				name: 'timeframeId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getTimeframes',
				},
				default: '',
				description:
					'Timeframe to move. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const firstName = this.getNodeParameter('firstName', i) as string;
	const lastName = this.getNodeParameter('lastName', i) as string;
	const stage = this.getNodeParameter('stage', i) as string;
	const source = this.getNodeParameter('source', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {
		firstName,
		lastName,
		stage,
		source,
		...additionalFields,
	};

	if (additionalFields.price) {
		body.price = toFloat(additionalFields.price as string, 'Price', this.getNode(), i);
	}

	if (additionalFields.tagsUi) {
		const tagsData = additionalFields.tagsUi as { tagsValues?: Array<{ tag: string }> };
		const tags = (tagsData.tagsValues || []).map((item) => item.tag).filter((tag) => tag.length > 0);
		if (tags.length > 0) {
			body.tags = tags;
		}
		delete body.tagsUi;
	}

	if (additionalFields.customFieldsUi) {
		const customFields = (additionalFields.customFieldsUi as IDataObject)
			.customFieldsValues as IDataObject[];
		if (customFields) {
			customFields.forEach((field) => {
				const key = field.key as string;
				if (key.startsWith('custom')) {
					body[key] = field.value;
				} else {
					body[`custom${key}`] = field.value;
				}
			});
		}
		delete body.customFieldsUi;
	}

	if (additionalFields.addressesUi) {
		const addressesData = additionalFields.addressesUi as { addressesValues?: IDataObject[] };
		if (addressesData.addressesValues) {
			body.addresses = addressesData.addressesValues;
		}
		delete body.addressesUi;
	}

	if (additionalFields.emailsUi) {
		const emailsData = additionalFields.emailsUi as { emailsValues?: IDataObject[] };
		if (emailsData.emailsValues) {
			body.emails = emailsData.emailsValues;
		}
		delete body.emailsUi;
	}

	if (additionalFields.phonesUi) {
		const phonesData = additionalFields.phonesUi as { phonesValues?: IDataObject[] };
		if (phonesData.phonesValues) {
			body.phones = phonesData.phonesValues;
		}
		delete body.phonesUi;
	}

	const qs: IDataObject = {};
	if (additionalFields.deduplicate) {
		qs.deduplicate = true;
		delete body.deduplicate;
	}

	const response = await apiRequest.call(this, 'POST', '/people', body, qs);
	return wrapData(response);
}
