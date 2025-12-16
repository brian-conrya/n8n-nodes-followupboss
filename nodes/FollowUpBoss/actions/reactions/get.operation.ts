import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['reactions'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Reaction ID',
		name: 'id',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the reaction to retrieve',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const id = this.getNodeParameter('id', i) as string;
	const response = await apiRequest.call(this, 'GET', `/reactions/${id}`);
	return wrapData(response);
}
