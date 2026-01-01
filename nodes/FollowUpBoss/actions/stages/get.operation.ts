import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getStageIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['stages'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getStageIdProperty(true, 'id', true),
		description: 'ID of the stage to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Stage ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/stages/${id}`);
	return wrapData(response);
}
