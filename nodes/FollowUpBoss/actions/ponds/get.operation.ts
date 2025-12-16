import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['ponds'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Pond Name or ID',
		name: 'pondId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPonds',
		},
		default: '',
		required: true,
		description:
			'ID of the pond to retrieve. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const pondId = toInt(this.getNodeParameter('pondId', i) as string, 'Pond ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/ponds/${pondId}`);
	return wrapData(response);
}
