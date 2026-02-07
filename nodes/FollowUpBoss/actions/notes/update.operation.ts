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
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getNoteIdProperty(),
		description: 'The ID of the note. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Gives a note a title or subject',
			},
			{
				displayName: 'Body',
				name: 'body',
				type: 'string',
				default: '',
				description: 'The content of the note',
				typeOptions: {
					editor: 'htmlEditor',
					rows: 5,
				},
			},
			{
				displayName: 'Is HTML',
				name: 'isHtml',
				type: 'boolean',
				default: false,
				description:
					'Whether to render the HTML tags contained within the body on the Follow Up Boss user interface',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const noteIdRaw = this.getNodeParameter('noteId', i) as string;
	const noteId = toInt(noteIdRaw, 'Note ID', this.getNode(), i);
	const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

	const body: IDataObject = {
		...updateFields,
	};

	const response = await apiRequest.call(this, 'PUT', `/notes/${noteId}`, body);
	return wrapData(response, i);
}
