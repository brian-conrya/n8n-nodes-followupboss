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
	getEmailTemplateIdProperty,
	getPersonIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['emailTemplates'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getEmailTemplateIdProperty(true, 'id'),
		description: 'ID of the template to retrieve. Choose from the list, or specify an ID.',
	},
	{
		...getPersonIdProperty(),
		displayName: 'Merge Person',
		name: 'mergePersonId',
		required: false,
		description:
			'When specified, the returned template will have its merge fields filled out with the specified person record and the current user record. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Email Template ID', this.getNode(), i);
	const mergePersonId = this.getNodeParameter('mergePersonId', i) as string;
	const qs: IDataObject = {};
	if (mergePersonId) {
		qs.mergePersonId = mergePersonId;
	}
	const response = await apiRequest.call(this, 'GET', `/templates/${id}`, {}, qs);
	return wrapData(response);
}
