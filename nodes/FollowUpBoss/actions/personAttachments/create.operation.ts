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
		resource: ['personAttachments'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		description: 'ID of the person. Choose from the list, or specify an ID.',
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
		placeholder: 'e.g. Contract.pdf',
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
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const uri = this.getNodeParameter('uri', i) as string;
	const fileName = this.getNodeParameter('fileName', i) as string;
	const fileSizeRaw = this.getNodeParameter('fileSize', i) as string;

	const body: IDataObject = { personId, uri, fileName };

	if (fileSizeRaw) {
		body.fileSize = toInt(fileSizeRaw, 'File Size', this.getNode(), i);
	}

	const response = await apiRequest.call(this, 'POST', '/personAttachments', body);
	return wrapData(response, i);
}
