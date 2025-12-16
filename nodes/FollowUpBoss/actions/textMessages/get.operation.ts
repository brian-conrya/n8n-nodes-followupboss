import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['textMessages'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Text Message ID',
		name: 'textMessageId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the text message to retrieve',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const textMessageIdRaw = this.getNodeParameter('textMessageId', i) as string;
	const textMessageId = toInt(textMessageIdRaw, 'Text Message ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/textMessages/${textMessageId}`);
	return wrapData(response);
}

