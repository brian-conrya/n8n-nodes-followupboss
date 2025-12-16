import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['appointments'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Person ID',
		name: 'personId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the person to create the appointment for',
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
				displayName: 'Invitees',
				name: 'invitees',
				type: 'fixedCollection',
				default: [],
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
								placeholder: 'e.g. Sarah Jones',
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
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const personIdRaw = this.getNodeParameter('personId', index) as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), index);
	const start = this.getNodeParameter('start', index) as string;
	const end = this.getNodeParameter('end', index) as string;
	const title = this.getNodeParameter('title', index) as string;
	const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

	const body: IDataObject = {
		personId,
		start,
		end,
		title,
		...additionalFields,
	};

	if (additionalFields.invitees) {
		const inviteesData = additionalFields.invitees as IDataObject;
		if (inviteesData.invitee) {
			body.invitees = inviteesData.invitee;
		}
	}

	const response = await apiRequest.call(this, 'POST', '/appointments', body);
	return wrapData(response);
}
