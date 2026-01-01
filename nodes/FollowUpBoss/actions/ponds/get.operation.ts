import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getPondIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['ponds'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPondIdProperty(true),
		description: 'ID of the pond to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const pondIdRaw = (this.getNodeParameter('pondId', i) as IDataObject).value as string;
	const pondId = toInt(pondIdRaw, 'Pond ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/ponds/${pondId}`);
	return wrapData(response);
}
