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
		resource: ['notes'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getNoteIdProperty(),
		description: 'ID of the note to delete. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const noteIdRaw = this.getNodeParameter('noteId', index) as string;
	const noteId = toInt(noteIdRaw, 'Note ID', this.getNode(), index);
	await apiRequest.call(this, 'DELETE', `/notes/${noteId}`);
	return wrapDeleteSuccess();
}
