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
	getDealCustomFieldIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['dealCustomFields'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getDealCustomFieldIdProperty(true, 'id'),
		description: 'The ID of the deal custom field. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Deal Custom Field ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/dealCustomFields/${id}`);
	return wrapData(response);
}
