import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getSmartListIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['smartLists'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getSmartListIdProperty(true, 'id'),
		description: 'ID of the smart list to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Smart List ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/smartLists/${id}`);
	return wrapData(response, i);
}
