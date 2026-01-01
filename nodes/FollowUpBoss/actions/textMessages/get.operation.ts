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
	wrapData,
	getTextMessageIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['textMessages'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getTextMessageIdProperty(),
		description: 'ID of the text message to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const textMessageIdRaw = this.getNodeParameter('textMessageId', i) as string;
	const textMessageId = toInt(textMessageIdRaw, 'Text Message ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/textMessages/${textMessageId}`);
	return wrapData(response);
}
