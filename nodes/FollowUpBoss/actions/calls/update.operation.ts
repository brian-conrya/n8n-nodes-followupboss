import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['calls'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Call ID',
		name: 'id',
		type: 'string',
		default: '',
		required: true,
		description: 'The ID of a call',
	},
	{
		displayName: 'Duration',
		name: 'duration',
		type: 'number',
		default: '',
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
		displayName: 'Person ID',
		name: 'personId',
		type: 'string',
		default: '',
		placeholder: '12254',
		description: 'The ID of a person associated with this call',
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
	{
		displayName: 'User Name or ID',
		name: 'userId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		default: '',
		description: 'The user that made or received the call (can only be set by administrators, otherwise the currently logged in user\'s ID is used). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Call ID', this.getNode(), i);
	const duration = this.getNodeParameter('duration', i) as number;
	const fromNumber = this.getNodeParameter('fromNumber', i) as string;
	const isIncoming = this.getNodeParameter('isIncoming', i) as boolean;
	const note = this.getNodeParameter('note', i) as string;
	const outcome = this.getNodeParameter('outcome', i) as string;
	const personIdRaw = this.getNodeParameter('personId', i) as string;
	const phone = this.getNodeParameter('phone', i) as string;
	const recordingUrl = this.getNodeParameter('recordingUrl', i) as string;
	const toNumber = this.getNodeParameter('toNumber', i) as string;
	const userIdRaw = this.getNodeParameter('userId', i) as string;

	const body: IDataObject = {};

	if (duration) {
		body.duration = duration;
	}
	if (fromNumber) {
		body.fromNumber = fromNumber;
	}
	if (isIncoming !== undefined) {
		body.isIncoming = isIncoming;
	}
	if (note) {
		body.note = note;
	}
	if (outcome) {
		body.outcome = outcome;
	}
	if (personIdRaw) {
		body.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	}
	if (phone) {
		body.phone = phone;
	}
	if (recordingUrl) {
		body.recordingUrl = recordingUrl;
	}
	if (toNumber) {
		body.toNumber = toNumber;
	}
	if (userIdRaw) {
		body.userId = toInt(userIdRaw, 'User ID', this.getNode(), i);
	}

	const response = await apiRequest.call(this, 'PUT', `/calls/${id}`, body);
	return wrapData(response);
}
