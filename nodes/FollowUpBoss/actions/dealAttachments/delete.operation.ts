import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { updateDisplayOptions, wrapDeleteSuccess } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['dealAttachments'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Deal Attachment ID',
		name: 'id',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the deal attachment to delete',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const id = this.getNodeParameter('id', i) as string;
	await apiRequest.call(this, 'DELETE', `/dealAttachments/${id}`);
	return wrapDeleteSuccess();
}
