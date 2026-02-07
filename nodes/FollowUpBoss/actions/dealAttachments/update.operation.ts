import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import type { IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	toInt,
	updateDisplayOptions,
	wrapData,
	getDealIdProperty,
	getDealAttachmentIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['dealAttachments'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getDealAttachmentIdProperty(true, 'id'),
		description: 'The ID of the attachment. Choose from the list, or specify an ID.',
	},
	{
		...getDealIdProperty(),
		description:
			'The ID of the deal you want to update the attachment for. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'URI',
		name: 'uri',
		type: 'string',
		default: '',
		required: true,
		description: 'The URI of an externally hosted file',
	},
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the file',
	},
	{
		displayName: 'File Size',
		name: 'fileSize',
		type: 'string',
		default: '',
		description: 'Size of the file in bytes',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Attachment ID', this.getNode(), i);

	const dealIdRaw = (this.getNodeParameter('dealId', i) as IDataObject).value as string;
	const dealId = toInt(dealIdRaw, 'Deal ID', this.getNode(), i);
	const uri = this.getNodeParameter('uri', i) as string;
	const fileName = this.getNodeParameter('fileName', i) as string;
	const fileSizeRaw = this.getNodeParameter('fileSize', i) as string;

	const body: IDataObject = { dealId, uri, fileName };

	if (fileSizeRaw) {
		body.fileSize = toInt(fileSizeRaw, 'File Size', this.getNode(), i);
	}

	const response = await apiRequest.call(this, 'PUT', `/dealAttachments/${id}`, body);
	return wrapData(response, i);
}
