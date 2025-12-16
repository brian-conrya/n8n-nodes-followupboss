import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapDeleteSuccess } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['notes'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Note ID',
		name: 'noteId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the note to delete',
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
