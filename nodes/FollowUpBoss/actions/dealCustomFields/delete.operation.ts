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
	wrapDeleteSuccess,
	getDealCustomFieldIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['dealCustomFields'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getDealCustomFieldIdProperty(true, 'id'),
		description:
			'The ID of the deal custom field to delete. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Deal Custom Field ID', this.getNode(), i);
	await apiRequest.call(this, 'DELETE', `/dealCustomFields/${id}`);
	return wrapDeleteSuccess();
}
