import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['calls'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Call ID',
		name: 'id',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the call to retrieve',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Call ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/calls/${id}`);
	return wrapData(response);
}
