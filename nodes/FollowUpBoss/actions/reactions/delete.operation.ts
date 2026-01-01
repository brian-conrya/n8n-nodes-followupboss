import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	toInt,
	updateDisplayOptions,
	wrapDeleteSuccess,
	getNoteIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['reactions'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Reference Type',
		name: 'refType',
		type: 'options',
		options: [
			{
				name: 'Note',
				value: 'Note',
			},
			{
				name: 'Call',
				value: 'Call',
			},
			{
				name: 'Threaded Reply',
				value: 'ThreadedReply',
			},
		],
		default: 'Note',
		required: true,
		description: 'The type of entity that is being reacted to',
	},
	{
		...getNoteIdProperty(true, 'refId'),
		description: 'ID of the reference object. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const refType = this.getNodeParameter('refType', i) as string;
	const refIdRaw = this.getNodeParameter('refId', i) as string;
	const refId = toInt(refIdRaw, 'Reference ID', this.getNode(), i);

	await apiRequest.call(this, 'DELETE', `/reactions/${refType}/${refId}`);
	return wrapDeleteSuccess();
}
