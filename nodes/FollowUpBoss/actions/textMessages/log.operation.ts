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
		resource: ['textMessages'],
		operation: ['log'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		description:
			'The ID of the person associated with the text message. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Message',
		name: 'message',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. Hello World',
		description: 'The body of the text message',
	},
	{
		displayName: 'To Number',
		name: 'toNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 888-555-1234',
		description: 'The phone number the text message was sent to (e.g., 888-555-1234)',
	},
	{
		displayName: 'From Number',
		name: 'fromNumber',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'e.g. 888-555-9876',
		description: 'The phone number the text messages was sent from (e.g., 888-555-9876)',
	},
	{
		displayName: 'Is Incoming',
		name: 'isIncoming',
		type: 'boolean',
		default: false,
		description: 'Whether the text was outgoing to a person or incoming from a person',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'External Label',
				name: 'externalLabel',
				type: 'string',
				default: '',
				placeholder: 'e.g. My Label',
				description:
					"An optional descriptive text that appears in the byline of the text message record on the person's timeline",
			},
			{
				displayName: 'External URL',
				name: 'externalUrl',
				type: 'string',
				default: '',
				placeholder: 'e.g. https://example.com',
				description:
					'An optional link that will appear in the byline of the text message record in the timeline',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const message = this.getNodeParameter('message', i) as string;
	const toNumber = this.getNodeParameter('toNumber', i) as string;
	const fromNumber = this.getNodeParameter('fromNumber', i) as string;
	const isIncoming = this.getNodeParameter('isIncoming', i) as boolean;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {
		personId,
		message,
		toNumber,
		fromNumber,
		isIncoming,
		...additionalFields,
	};

	const response = await apiRequest.call(this, 'POST', '/textMessages', body);
	return wrapData(response, i);
}
