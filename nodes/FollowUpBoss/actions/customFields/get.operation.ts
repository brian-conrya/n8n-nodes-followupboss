import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	toInt,
	updateDisplayOptions,
	wrapData,
	getCustomFieldIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['customFields'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getCustomFieldIdProperty(true, 'id'),
		description: 'The custom field to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Custom Field ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/customFields/${id}`);
	return wrapData(response);
}
