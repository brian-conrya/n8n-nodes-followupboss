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
	getAppointmentIdProperty,
	getAppointmentOutcomeIdProperty,
	getAppointmentTypeIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['appointments'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getAppointmentIdProperty(true),
		description: 'ID of the appointment to update. Choose from the list, or specify an ID.',
	},
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
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'All Day',
				name: 'allDay',
				type: 'boolean',
				default: false,
				description: 'Whether the appointment is all day',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
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
				displayName: 'Location',
				name: 'location',
				type: 'string',
				default: '',
				description: 'Location of the appointment',
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
	const appointmentIdRaw = (this.getNodeParameter('appointmentId', i) as IDataObject)
		.value as string;
	const appointmentId = toInt(appointmentIdRaw, 'Appointment ID', this.getNode(), i);
	const start = this.getNodeParameter('start', i) as string;
	const end = this.getNodeParameter('end', i) as string;
	const title = this.getNodeParameter('title', i) as string;
	const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

	if (updateFields.outcomeId) {
		updateFields.outcomeId = (updateFields.outcomeId as IDataObject).value;
	}

	const body: IDataObject = {
		start,
		end,
		title,
		...updateFields,
	};

	if (this.getNodeParameter('typeId', i, undefined)) {
		body.typeId = (this.getNodeParameter('typeId', i) as IDataObject).value;
	}

	const invitees: IDataObject[] = [];
	if (updateFields.inviteeUserIds) {
		(updateFields.inviteeUserIds as string)
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.forEach((userId) =>
				invitees.push({ userId: toInt(userId, 'User ID', this.getNode(), i) }),
			);
	}
	if (updateFields.inviteePersonIds) {
		(updateFields.inviteePersonIds as string)
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.forEach((personId) =>
				invitees.push({ personId: toInt(personId, 'Person ID', this.getNode(), i) }),
			);
	}
	if (updateFields.inviteeRelationshipIds) {
		(updateFields.inviteeRelationshipIds as string)
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
			.forEach((relationshipId) =>
				invitees.push({
					relationshipId: toInt(relationshipId, 'Relationship ID', this.getNode(), i),
				}),
			);
	}
	if (updateFields.inviteeEmails) {
		(updateFields.inviteeEmails as string)
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

	const response = await apiRequest.call(this, 'PUT', `/appointments/${appointmentId}`, body);
	return wrapData(response, i);
}
