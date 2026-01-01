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
	getRelationshipIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['peopleRelationships'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getRelationshipIdProperty(),
		description: 'ID of the relationship to update. Choose from the list, or specify an ID.',
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
				name: 'addresses',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description:
					'Addresses (will overwrite existing addresses). (This is the address where this person can be contacted, it is not the address of a property this person may be interested in selling or buying).',
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
				name: 'emails',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Email addresses (will overwrite existing emails)',
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
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				placeholder: 'e.g. Nathan',
				description: 'First name of the related person',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				placeholder: 'e.g. Smith',
				description: 'Last name of the related person',
			},
			{
				displayName: 'Phones',
				name: 'phones',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				description: 'Phone numbers (will overwrite existing phones)',
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
				displayName: 'Type',
				name: 'type',
				type: 'string',
				default: '',
				placeholder: 'e.g. Spouse',
				description: 'Type of relationship (e.g., Spouse, Child, Parent)',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const relationshipIdRaw = (this.getNodeParameter('relationshipId', i) as IDataObject)
		.value as string;
	const relationshipId = toInt(relationshipIdRaw, 'Relationship ID', this.getNode(), i);
	const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

	const body: IDataObject = { ...updateFields };

	if (updateFields.emails) {
		const emailsData = updateFields.emails as { emailsValues?: IDataObject[] };
		if (emailsData.emailsValues) {
			body.emails = emailsData.emailsValues;
		} else {
			delete body.emails;
		}
	}

	if (updateFields.phones) {
		const phonesData = updateFields.phones as { phonesValues?: IDataObject[] };
		if (phonesData.phonesValues) {
			body.phones = phonesData.phonesValues;
		} else {
			delete body.phones;
		}
	}

	if (updateFields.addresses) {
		const addressesData = updateFields.addresses as { addressesValues?: IDataObject[] };
		if (addressesData.addressesValues) {
			body.addresses = addressesData.addressesValues;
		} else {
			delete body.addresses;
		}
	}

	const response = await apiRequest.call(
		this,
		'PUT',
		`/peopleRelationships/${relationshipId}`,
		body,
	);
	return wrapData(response);
}
