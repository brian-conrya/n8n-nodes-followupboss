import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getEmailTemplateIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['emailTemplates'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getEmailTemplateIdProperty(true, 'id'),
		description:
			'ID of the template to update. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the template',
			},
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				default: '',
				description: 'Subject of the template',
			},
			{
				displayName: 'Body HTML',
				name: 'body',
				type: 'string',
				default: '',
				description: 'Body of the template',
				typeOptions: {
					rows: 5,
					editor: 'htmlEditor',
				},
			},
			{
				displayName: 'Is Shared',
				name: 'isShared',
				type: 'boolean',
				default: false,
				description:
					'Whether this email template should be shared with other users in the same Follow Up Boss account',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Email Template ID', this.getNode(), i);
	const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;
	const body = { ...updateFields };
	const response = await apiRequest.call(this, 'PUT', `/templates/${id}`, body);
	return wrapData(response);
}
