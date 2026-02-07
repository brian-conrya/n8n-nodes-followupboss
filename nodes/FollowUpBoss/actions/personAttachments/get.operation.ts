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
	getPersonAttachmentIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['personAttachments'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonAttachmentIdProperty(),
		description: 'ID of the person attachment to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Person Attachment ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/personAttachments/${id}`);
	return wrapData(response, i);
}
