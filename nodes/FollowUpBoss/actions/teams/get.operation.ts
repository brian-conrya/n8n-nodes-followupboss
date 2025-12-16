import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['teams'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Team Name or ID',
		name: 'id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTeams',
		},
		required: true,
		default: '',
		description:
			'ID of the team to retrieve. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const id = toInt(this.getNodeParameter('id', i) as string, 'ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/teams/${id}`);
	return wrapData(response);
}
