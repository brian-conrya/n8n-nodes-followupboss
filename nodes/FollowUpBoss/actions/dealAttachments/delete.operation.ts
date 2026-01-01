import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	updateDisplayOptions,
	wrapDeleteSuccess,
	getDealAttachmentIdProperty,
	toInt,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['dealAttachments'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getDealAttachmentIdProperty(true, 'id'),
		description: 'ID of the deal attachment to delete. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Deal Attachment ID', this.getNode(), i);
	await apiRequest.call(this, 'DELETE', `/dealAttachments/${id}`);
	return wrapDeleteSuccess();
}
