import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getNoteIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['notes'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getNoteIdProperty(),
		description: 'The ID of the note. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Include Threaded Replies',
		name: 'includeThreadedReplies',
		type: 'boolean',
		default: false,
		description: 'Whether to include threaded replies attached to the note',
	},
	{
		displayName: 'Include Reactions',
		name: 'includeReactions',
		type: 'boolean',
		default: false,
		description: 'Whether to include the reactions that have been left on the note',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const noteIdRaw = this.getNodeParameter('noteId', index) as string;
	const noteId = toInt(noteIdRaw, 'Note ID', this.getNode(), index);
	const includeThreadedReplies = this.getNodeParameter('includeThreadedReplies', index) as boolean;
	const includeReactions = this.getNodeParameter('includeReactions', index) as boolean;

	const qs: IDataObject = {};
	if (includeThreadedReplies) qs.includeThreadedReplies = includeThreadedReplies;
	if (includeReactions) qs.includeReactions = includeReactions;

	const response = await apiRequest.call(this, 'GET', `/notes/${noteId}`, {}, qs);
	return wrapData(response);
}
