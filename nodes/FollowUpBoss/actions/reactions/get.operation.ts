import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getReactionIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['reactions'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getReactionIdProperty(),
		description: 'ID of the reaction to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Reaction ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/reactions/${id}`);
	return wrapData(response);
}
