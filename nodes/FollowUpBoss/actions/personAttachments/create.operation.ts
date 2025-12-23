import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
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
		displayName: 'URL',
		name: 'url',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. https://example.com/file.pdf',
		description: 'URL of the attachment',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		placeholder: 'e.g. Contract.pdf',
		description: 'Name of the attachment',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const url = this.getNodeParameter('url', i) as string;
	const name = this.getNodeParameter('name', i) as string;
	const body: IDataObject = { personId, url };
	if (name) {
		body.name = name;
	}
	const response = await apiRequest.call(this, 'POST', '/personAttachments', body);
	return wrapData(response);
}
