import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['emailTemplates'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Template Name or ID',
		name: 'id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getEmailTemplates',
		},
		default: '',
		required: true,
		description:
			'ID of the template to retrieve. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Merge Person ID',
		name: 'mergePersonId',
		type: 'string',
		default: '',
		description:
			'When specified, the returned template will have its merge fields filled out with the specified person record and the current user record',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Template ID', this.getNode(), i);
	const mergePersonId = this.getNodeParameter('mergePersonId', i) as string;
	const qs: IDataObject = {};
	if (mergePersonId) {
		qs.mergePersonId = toInt(mergePersonId, 'Merge Person ID', this.getNode(), i);
	}
	const response = await apiRequest.call(this, 'GET', `/templates/${id}`, {}, qs);
	return wrapData(response);
}
