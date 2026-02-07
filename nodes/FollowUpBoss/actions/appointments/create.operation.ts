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
	getAppointmentOutcomeIdProperty,
	getAppointmentTypeIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['appointments'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Start Time',
		name: 'start',
		type: 'dateTime',
		default: '',
		required: true,
		description: 'Start time of the appointment',
	},
	{
		displayName: 'End Time',
		name: 'end',
		type: 'dateTime',
		default: '',
		required: true,
		description: 'End time of the appointment',
	},
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Initial Consultation',
		description: 'Title of the appointment',
	},
	{
		...getAppointmentTypeIdProperty(false),
		description: 'The type of the appointment. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'All Day',
				name: 'allDay',
				type: 'boolean',
				default: false,
				description: 'Whether the appointment lasts all day',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				placeholder: 'e.g. Discussing requirements',
				description: 'Description of the appointment',
			},
			{
				displayName: 'Invitee Emails',
				name: 'inviteeEmails',
				type: 'string',
				default: '',
				placeholder: 'name@email.com, other@email.com',
				description: 'Comma-separated list of emails to invite',
			},
			{
				displayName: 'Invitee Person IDs',
				name: 'inviteePersonIds',
				type: 'string',
				default: '',
				placeholder: 'e.g. 123, 456',
				description: 'Comma-separated list of Person IDs to invite',
			},
			{
				displayName: 'Invitee Relationship IDs',
				name: 'inviteeRelationshipIds',
				type: 'string',
				default: '',
				placeholder: 'e.g. 789, 012',
				description: 'Comma-separated list of Relationship IDs to invite',
			},
			{
				displayName: 'Invitee User IDs',
				name: 'inviteeUserIds',
				type: 'string',
				default: '',
				placeholder: 'e.g. 1, 2, 3',
				description: 'Comma-separated list of User IDs to invite',
			},
			{
				...getAppointmentOutcomeIdProperty(false, 'outcomeId'),
				description: 'ID of the appointment outcome. Choose from the list, or specify an ID.',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const start = this.getNodeParameter('start', i) as string;
	const end = this.getNodeParameter('end', i) as string;
	const title = this.getNodeParameter('title', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	if (additionalFields.outcomeId) {
		additionalFields.outcomeId = (additionalFields.outcomeId as IDataObject).value;
	}

	const body: IDataObject = {
		start,
		end,
		title,
		...additionalFields,
	};

	if (this.getNodeParameter('typeId', i, undefined)) {
		body.typeId = (this.getNodeParameter('typeId', i) as IDataObject).value;
	}

	const invitees: IDataObject[] = [];
	if (additionalFields.inviteeUserIds) {
		(additionalFields.inviteeUserIds as string)
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.forEach((userId) =>
				invitees.push({ userId: toInt(userId, 'User ID', this.getNode(), i) }),
			);
	}
	if (additionalFields.inviteePersonIds) {
		(additionalFields.inviteePersonIds as string)
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.forEach((personId) =>
				invitees.push({ personId: toInt(personId, 'Person ID', this.getNode(), i) }),
			);
	}
	if (additionalFields.inviteeRelationshipIds) {
		(additionalFields.inviteeRelationshipIds as string)
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.forEach((relationshipId) =>
				invitees.push({
					relationshipId: toInt(relationshipId, 'Relationship ID', this.getNode(), i),
				}),
			);
	}
	if (additionalFields.inviteeEmails) {
		(additionalFields.inviteeEmails as string)
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.forEach((email) => invitees.push({ email }));
	}

	if (invitees.length > 0) {
		body.invitees = invitees;
	}

	delete body.inviteeUserIds;
	delete body.inviteePersonIds;
	delete body.inviteeRelationshipIds;
	delete body.inviteeEmails;

	const response = await apiRequest.call(this, 'POST', '/appointments', body);
	return wrapData(response, i);
}
