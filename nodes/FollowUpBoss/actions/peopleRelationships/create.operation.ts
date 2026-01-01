import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getPersonIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['peopleRelationships'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(true, 'personId'),
		description:
			'ID of the person this relationship is associated with. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Nathan',
		description: 'First name of the related person',
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Smith',
		description: 'Last name of the related person',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Spouse',
		description: 'Type of relationship (e.g., Spouse, Child, Parent)',
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
								type: 'string',
								default: 'home',
								description: 'The address type. (e.g., "home", "work", "mailing", etc.).',
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
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const firstName = this.getNodeParameter('firstName', i) as string;
	const lastName = this.getNodeParameter('lastName', i) as string;
	const type = this.getNodeParameter('type', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {
		personId,
		firstName,
		lastName,
		type,
	};

	if (additionalFields.addressesUi) {
		const addressesData = additionalFields.addressesUi as { addressesValues?: IDataObject[] };
		if (addressesData.addressesValues) {
			body.addresses = addressesData.addressesValues;
		}
	}

	if (additionalFields.emailsUi) {
		const emailsData = additionalFields.emailsUi as { emailsValues?: IDataObject[] };
		if (emailsData.emailsValues) {
			body.emails = emailsData.emailsValues;
		}
	}

	if (additionalFields.phonesUi) {
		const phonesData = additionalFields.phonesUi as { phonesValues?: IDataObject[] };
		if (phonesData.phonesValues) {
			body.phones = phonesData.phonesValues;
		}
	}

	const response = await apiRequest.call(this, 'POST', '/peopleRelationships', body);
	return wrapData(response);
}
