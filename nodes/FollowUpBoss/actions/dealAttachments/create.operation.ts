import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import type { IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getDealIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['dealAttachments'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		...getDealIdProperty(),
		description:
			'The ID of the deal you want to add an attachment to. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'URI',
		name: 'uri',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. https://example.com/file.pdf',
		description: 'The URI of an externally hosted file',
	},
	{
		displayName: 'File Name',
		name: 'fileName',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. PurchaseAgreement.pdf',
		description: 'Name of the file',
	},
	{
		displayName: 'File Size',
		name: 'fileSize',
		type: 'string',
		default: '',
		placeholder: 'e.g. 1024',
		description: 'Size of the file in bytes',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const dealIdRaw = (this.getNodeParameter('dealId', i) as IDataObject).value as string;
	const dealId = toInt(dealIdRaw, 'Deal ID', this.getNode(), i);
	const uri = this.getNodeParameter('uri', i) as string;
	const fileName = this.getNodeParameter('fileName', i) as string;
	const fileSizeRaw = this.getNodeParameter('fileSize', i) as string;

	const body: IDataObject = { dealId, uri, fileName };

	if (fileSizeRaw) {
		body.fileSize = toInt(fileSizeRaw, 'File Size', this.getNode(), i);
	}

	const response = await apiRequest.call(this, 'POST', '/dealAttachments', body);
	return wrapData(response, i);
}
