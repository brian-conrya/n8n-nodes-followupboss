import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['appointments'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Appointment ID',
		name: 'appointmentId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the appointment to update',
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
								displayName: 'Person ID',
								name: 'personId',
								type: 'number',
								default: 0,
								description: 'ID of the person to invite',
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
				displayName: 'Outcome Name or ID',
				name: 'outcomeId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getAppointmentOutcomes',
				},
				default: '',
				description:
					'ID of the appointment outcome. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
	const appointmentIdRaw = this.getNodeParameter('appointmentId', index) as string;
	const appointmentId = toInt(appointmentIdRaw, 'Appointment ID', this.getNode(), index);
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {
		...updateFields,
	};

	if (updateFields.invitees) {
		const inviteesData = updateFields.invitees as IDataObject;
		if (inviteesData.invitee) {
			body.invitees = inviteesData.invitee;
		}
	}

	const response = await apiRequest.call(this, 'PUT', `/ appointments / ${appointmentId} `, body);
	return wrapData(response);
}
