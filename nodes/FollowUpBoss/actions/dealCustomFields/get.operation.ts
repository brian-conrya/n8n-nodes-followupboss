import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['dealCustomFields'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Deal Custom Field Name or ID',
		name: 'id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getDealCustomFields',
		},
		default: '',
		required: true,
		description: 'The ID of the deal custom field. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Deal Custom Field ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/dealCustomFields/${id}`);
	return wrapData(response);
}
