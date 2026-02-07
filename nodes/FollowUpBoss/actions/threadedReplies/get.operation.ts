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
	getThreadedReplyIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['threadedReplies'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getThreadedReplyIdProperty(true, 'id'),
		description: 'ID of the threaded reply to retrieve',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Threaded Reply ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/threadedReplies/${id}`);
	return wrapData(response, i);
}
