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
	wrapDeleteSuccess,
	getPersonAttachmentIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['personAttachments'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonAttachmentIdProperty(true, 'id'),
		description: 'ID of the person attachment to delete',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Person Attachment ID', this.getNode(), i);
	await apiRequest.call(this, 'DELETE', `/personAttachments/${id}`);
	return wrapDeleteSuccess();
}
