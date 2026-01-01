import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getPersonIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['notes'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		description: 'The ID of a person. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		default: '',
		placeholder: 'e.g. Meeting Notes',
		description: 'Gives a note a title or subject',
	},
	{
		displayName: 'Body',
		name: 'body',
		type: 'string',
		typeOptions: {
			editor: 'htmlEditor',
			rows: 5,
		},
		default: '',
		required: true,
		placeholder: 'e.g. Discussed pricing and timeline',
		description: 'The content of the note',
	},
	{
		displayName: 'Is HTML',
		name: 'isHtml',
		type: 'boolean',
		default: false,
		description:
			'Whether to render the HTML tags contained within the body on the Follow Up Boss user interface',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', index) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), index);
	const bodyContent = this.getNodeParameter('body', index) as string;
	const subject = this.getNodeParameter('subject', index) as string;
	const isHtml = this.getNodeParameter('isHtml', index) as boolean;

	const body = {
		personId,
		body: bodyContent,
		subject,
		isHtml,
	};

	const response = await apiRequest.call(this, 'POST', '/notes', body);
	return wrapData(response);
}
