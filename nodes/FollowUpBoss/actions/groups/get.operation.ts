import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getGroupIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['groups'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getGroupIdProperty(true, 'id'),
		description: 'ID of the group to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Group ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/groups/${id}`);
	return wrapData(response, i);
}
