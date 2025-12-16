import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';

import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['dealAttachments'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Attachment ID',
		name: 'attachmentId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the deal attachment to retrieve',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const attachmentIdRaw = this.getNodeParameter('attachmentId', i) as string;
	const attachmentId = toInt(attachmentIdRaw, 'Attachment ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/dealAttachments/${attachmentId}`);
	return wrapData(response);
}
