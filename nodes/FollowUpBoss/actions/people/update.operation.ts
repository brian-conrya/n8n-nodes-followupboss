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
	toFloat,
	getPersonIdProperty,
	getLenderIdProperty,
	getPondIdProperty,
	getUserIdProperty,
	getCustomFieldNameProperty,
	getStageIdProperty,
	getTimeframeIdProperty,
	getTagsProperty,
	normalizeTags,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'id',
	},
	...getTagsProperty(),
	{
		displayName: 'Merge Tags',
		name: 'mergeTags',
		type: 'boolean',
		default: true,
		description: 'Whether to merge tags with existing ones or overwrite them',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
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
							},
							{
								displayName: 'City',
								name: 'city',
								type: 'string',
								default: '',
							},
							{
								displayName: 'State',
								name: 'state',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Zip Code',
								name: 'code',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Country',
								name: 'country',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
			{
				...getLenderIdProperty('Assigned Lender', 'assignedLenderId', false),
				description: 'Lender assigned to this person. Choose from the list, or specify an ID.',
			},
			{
				...getPondIdProperty(false),
				name: 'assignedPondId',
				description: 'Pond assigned to this person. Choose from the list, or specify an ID.',
			},
			{
				...getUserIdProperty('Assigned User', 'assignedUserId', false),
				description: 'Agent assigned to this person. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'Background',
				name: 'background',
				type: 'string',
				default: '',
				description: 'Background information on the person',
			},
			{
				displayName: 'Contacted',
				name: 'contacted',
				type: 'boolean',
				default: false,
				description: 'Whether the person has been contacted or not',
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
								...getCustomFieldNameProperty(true, 'key'),
								description:
									'Name of the custom field (with or without "custom" prefix). Choose from the list, or specify an ID.',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value of the custom field',
							},
						],
					},
				],
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
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
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
				description: 'Price of the property',
			},
			{
				...getStageIdProperty(false, 'stage'),
				description: 'The stage the person is in. Choose from the list, or specify a stage name.',
			},
			{
				...getTimeframeIdProperty(false, 'timeframeId'),
				description: 'Timeframe to move. Choose from the list, or specify an ID.',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Person ID', this.getNode(), i);
	const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

	const body: IDataObject = {
		...updateFields,
	};

	if (updateFields.price) {
		body.price = toFloat(updateFields.price as string, 'Price', this.getNode(), i);
	}

	const qs: IDataObject = {};

	const tagsMode = this.getNodeParameter('tagsMode', i, 'manual') as string;
	let tags: string[] = [];
	if (tagsMode === 'manual') {
		const tagsManual = this.getNodeParameter('tagsManual', i, '') as string;
		tags = normalizeTags(tagsMode, tagsManual, undefined);
	} else {
		const tagsJson = this.getNodeParameter('tagsJson', i, undefined);
		tags = normalizeTags(tagsMode, undefined, tagsJson);
	}

	if (tags.length > 0) {
		body.tags = tags;
	}

	const mergeTags = this.getNodeParameter('mergeTags', i, true) as boolean;
	if (mergeTags) {
		qs.mergeTags = true;
	}

	if (updateFields.customFieldsUi) {
		const customFields = (updateFields.customFieldsUi as IDataObject)
			.customFieldsValues as IDataObject[];
		if (customFields) {
			customFields.forEach((field) => {
				let key = field.key as string;
				if (typeof field.key === 'object' && field.key !== null) {
					key = (field.key as IDataObject).value as string;
				}
				if (key.startsWith('custom')) {
					body[key] = field.value;
				} else {
					body[`custom${key}`] = field.value;
				}
			});
		}
		delete body.customFieldsUi;
	}

	if (updateFields.addressesUi) {
		const addressesData = updateFields.addressesUi as { addressesValues?: IDataObject[] };
		if (addressesData.addressesValues) {
			body.addresses = addressesData.addressesValues;
		}
		delete body.addressesUi;
	}

	if (updateFields.emailsUi) {
		const emailsData = updateFields.emailsUi as { emailsValues?: IDataObject[] };
		if (emailsData.emailsValues) {
			body.emails = emailsData.emailsValues;
		}
		delete body.emailsUi;
	}

	if (updateFields.phonesUi) {
		const phonesData = updateFields.phonesUi as { phonesValues?: IDataObject[] };
		if (phonesData.phonesValues) {
			body.phones = phonesData.phonesValues;
		}
		delete body.phonesUi;
	}

	const response = await apiRequest.call(this, 'PUT', `/people/${id}`, body, qs);
	return wrapData(response);
}
