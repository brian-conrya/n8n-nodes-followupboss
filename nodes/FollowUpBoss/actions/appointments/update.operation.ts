import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getAppointmentIdProperty, getPersonIdProperty, getAppointmentOutcomeIdProperty } from '../../helpers/utils';

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
				displayName: 'End Time',
				name: 'end',
				type: 'dateTime',
				default: '',
				description: 'End time of the appointment',
			},
			{
				displayName: 'Invitees',
				name: 'invitees',
				type: 'fixedCollection',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						name: 'invitee',
						displayName: 'Invitee',
						values: [
							{
								displayName: 'Name',
								name: 'name',
								type: 'string',
								default: '',
								description: 'Name of the invitee',
							},
							{
								displayName: 'Email',
								name: 'email',
								type: 'string',
								default: '',
								placeholder: 'name@email.com',
								description: 'Email of the invitee',
							},
							{
								...getPersonIdProperty(),
								displayName: 'Person',
								name: 'personId',
								required: false,
								description: 'ID of the person to invite. Choose from the list, or specify an ID.',
							},
						],
					},
				],
				description: 'List of people to invite',
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
				description:
					'ID of the appointment outcome. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'Start Time',
				name: 'start',
				type: 'dateTime',
				default: '',
				description: 'Start time of the appointment',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Title of the appointment',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const appointmentIdRaw = (this.getNodeParameter('appointmentId', index) as IDataObject).value as string;
	const appointmentId = toInt(appointmentIdRaw, 'Appointment ID', this.getNode(), index);
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	if (updateFields.outcomeId) {
		updateFields.outcomeId = (updateFields.outcomeId as IDataObject).value;
	}

	const body: IDataObject = {
		...updateFields,
	};

	if (updateFields.invitees) {
		const inviteesData = updateFields.invitees as IDataObject;
		if (inviteesData.invitee) {
			body.invitees = inviteesData.invitee;
		}
	}

	const response = await apiRequest.call(this, 'PUT', `/appointments/${appointmentId}`, body);
	return wrapData(response);
}
