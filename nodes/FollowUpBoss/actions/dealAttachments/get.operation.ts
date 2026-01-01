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
	getDealAttachmentIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['dealAttachments'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getDealAttachmentIdProperty(),
		description: 'ID of the deal attachment to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const attachmentIdRaw = this.getNodeParameter('attachmentId', i) as string;
	const attachmentId = toInt(attachmentIdRaw, 'Attachment ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/dealAttachments/${attachmentId}`);
	return wrapData(response);
}
