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
	getTextMessageTemplateIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['textMessageTemplates'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getTextMessageTemplateIdProperty(true, 'id'),
		description: 'ID of the template to delete. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Text Message Template ID', this.getNode(), i);
	await apiRequest.call(this, 'DELETE', `/textMessageTemplates/${id}`);
	return wrapDeleteSuccess();
}
