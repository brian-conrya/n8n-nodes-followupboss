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
	getEmailTemplateIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['emailTemplates'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getEmailTemplateIdProperty(true, 'id'),
		description: 'ID of the template to delete. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Email Template ID', this.getNode(), i);
	await apiRequest.call(this, 'DELETE', `/templates/${id}`);
	return wrapDeleteSuccess();
}
