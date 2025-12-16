import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['peopleRelationships'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Relationship ID',
		name: 'relationshipId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the relationship to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
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
								description: 'Email address',
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
				description: 'First name of the related person',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
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
								description: 'Phone number',
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
				description: 'Type of relationship (e.g., Spouse, Child, Parent)',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const relationshipIdRaw = this.getNodeParameter('relationshipId', i) as string;
	const relationshipId = toInt(relationshipIdRaw, 'Relationship ID', this.getNode(), i);
	const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

	const body: IDataObject = { ...updateFields };

	// Transform emails and phones arrays if present
	if (updateFields.emails) {
		const emailsData = updateFields.emails as IDataObject;
		if (emailsData.emailsValues) {
			body.emails = emailsData.emailsValues;
			delete body.emails;
			body.emails = emailsData.emailsValues;
		}
	}

	if (updateFields.phones) {
		const phonesData = updateFields.phones as IDataObject;
		if (phonesData.phonesValues) {
			body.phones = phonesData.phonesValues;
		}
	}

	const response = await apiRequest.call(this, 'PUT', `/peopleRelationships/${relationshipId}`, body);
	return wrapData(response);
}
