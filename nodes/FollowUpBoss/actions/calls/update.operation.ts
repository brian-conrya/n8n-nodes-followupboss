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
	getCallIdProperty,
	getPersonIdProperty,
	getUserIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['calls'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getCallIdProperty(),
		description: 'The ID of a call. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Duration',
				name: 'duration',
				type: 'number',
				default: 0,
				placeholder: '63',
				description: 'Length of the call in seconds',
			},
			{
				displayName: 'From Number',
				name: 'fromNumber',
				type: 'string',
				default: '',
				description: 'The phone number this call was made from',
			},
			{
				displayName: 'Is Incoming',
				name: 'isIncoming',
				type: 'boolean',
				default: true,
				description: 'Whether this is an incoming or outgoing call',
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				placeholder: "John didn't have time to talk, call back on friday",
				description: 'The log message entered for this call',
			},
			{
				displayName: 'Outcome',
				name: 'outcome',
				type: 'options',
				options: [
					{ name: 'Bad Number', value: 'Bad Number' },
					{ name: 'Busy', value: 'Busy' },
					{ name: 'Interested', value: 'Interested' },
					{ name: 'Left Message', value: 'Left Message' },
					{ name: 'No Answer', value: 'No Answer' },
					{ name: 'Not Interested', value: 'Not Interested' },
				],
				default: 'Interested',
				description: 'The outcome of the call',
			},
			{
				...getPersonIdProperty(),
				name: 'personId',
				required: false,
				description:
					'The person associated with this call. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				placeholder: '555-405-0815',
				description: 'The phone number this call was made to or from',
			},
			{
				displayName: 'Recording URL',
				name: 'recordingUrl',
				type: 'string',
				default: '',
				description: 'The URL for the call recording',
			},
			{
				displayName: 'To Number',
				name: 'toNumber',
				type: 'string',
				default: '',
				description: 'The phone number this call was made to',
			},
			getUserIdProperty('User', 'userId', false),
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Call ID', this.getNode(), i);
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {};

	if (additionalFields.duration) {
		body.duration = additionalFields.duration;
	}
	if (additionalFields.fromNumber) {
		body.fromNumber = additionalFields.fromNumber;
	}
	if (additionalFields.isIncoming !== undefined) {
		body.isIncoming = additionalFields.isIncoming;
	}
	if (additionalFields.note) {
		body.note = additionalFields.note;
	}
	if (additionalFields.outcome) {
		body.outcome = additionalFields.outcome;
	}
	if (additionalFields.personId) {
		const personIdRaw = (additionalFields.personId as IDataObject).value as string;
		body.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	}
	if (additionalFields.phone) {
		body.phone = additionalFields.phone;
	}
	if (additionalFields.recordingUrl) {
		body.recordingUrl = additionalFields.recordingUrl;
	}
	if (additionalFields.toNumber) {
		body.toNumber = additionalFields.toNumber;
	}
	if (additionalFields.userId) {
		const userIdRaw = (additionalFields.userId as IDataObject).value as string;
		body.userId = toInt(userIdRaw, 'User ID', this.getNode(), i);
	}

	const response = await apiRequest.call(this, 'PUT', `/calls/${id}`, body);
	return wrapData(response);
}
