import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getPersonIdProperty, getUserIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['calls'],
		operation: ['log'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'personId',
	},
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		default: '',
		required: true,
		placeholder: '555-405-0815',
		description: 'The phone number this call was made to or from',
	},
	{
		displayName: 'Is Incoming',
		name: 'isIncoming',
		type: 'boolean',
		default: true,
		required: true,
		description: 'Whether this is an incoming or outgoing call',
	},
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
		placeholder: 'e.g. 555-555-5555',
		description: 'The phone number this call was made from',
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
		displayName: 'Recording URL',
		name: 'recordingUrl',
		type: 'string',
		default: '',
		placeholder: 'e.g. https://example.com/recording.mp3',
		description: 'The URL for the call recording',
	},
	{
		displayName: 'To Number',
		name: 'toNumber',
		type: 'string',
		default: '',
		placeholder: 'e.g. 555-555-5555',
		description: 'The phone number this call was made to',
	},
	{
		...getUserIdProperty('User', 'userId', false),
		description: 'The user that made or received the call (can only be set by administrators, otherwise the currently logged in user\'s ID is used). Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const phone = this.getNodeParameter('phone', i) as string;
	const isIncoming = this.getNodeParameter('isIncoming', i) as boolean;
	const duration = this.getNodeParameter('duration', i) as number;
	const fromNumber = this.getNodeParameter('fromNumber', i) as string;
	const note = this.getNodeParameter('note', i) as string;
	const outcome = this.getNodeParameter('outcome', i) as string;
	const recordingUrl = this.getNodeParameter('recordingUrl', i) as string;
	const toNumber = this.getNodeParameter('toNumber', i) as string;
	const userIdParam = this.getNodeParameter('userId', i) as IDataObject;

	const body: IDataObject = {
		personId,
		phone,
		isIncoming,
	};

	if (duration) {
		body.duration = duration;
	}
	if (fromNumber) {
		body.fromNumber = fromNumber;
	}
	if (note) {
		body.note = note;
	}
	if (outcome) {
		body.outcome = outcome;
	}
	if (recordingUrl) {
		body.recordingUrl = recordingUrl;
	}
	if (toNumber) {
		body.toNumber = toNumber;
	}
	if (userIdParam?.value) {
		body.userId = toInt(userIdParam.value as string, 'User ID', this.getNode(), i);
	}

	const response = await apiRequest.call(this, 'POST', '/calls', body);
	return wrapData(response);
}
