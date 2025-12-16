import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['emailTemplates'],
		operation: ['merge'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Template Name or ID',
		name: 'templateId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getEmailTemplates',
		},
		default: '',
		description:
			'ID of the template to merge. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Merge Person ID',
		name: 'mergePersonId',
		type: 'string',
		default: '',
		description: 'Person ID to use for merge fields like %contact_name%',
	},
	{
		displayName: 'Recipients',
		name: 'recipients',
		type: 'fixedCollection',
		placeholder: 'Add Recipient',
		default: {},
		options: [
			{
				displayName: 'To',
				name: 'to',
				values: [
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
						required: true,
						placeholder: 'name@email.com',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
					},
				],
			},
		],
		description: 'List of recipients in the To: field of this email',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const templateId = this.getNodeParameter('templateId', i) as string;
	const mergePersonId = this.getNodeParameter('mergePersonId', i) as string;
	const recipients = this.getNodeParameter('recipients', i) as IDataObject;

	const body: IDataObject = { templateId };

	if (templateId) {
		body.templateId = toInt(templateId, 'Template ID', this.getNode(), i);
	}
	if (mergePersonId) {
		body.mergePersonId = toInt(mergePersonId, 'Merge Person ID', this.getNode(), i);
	}

	if (recipients && recipients.to) {
		body.recipients = {
			to: recipients.to,
		};
	}

	const response = await apiRequest.call(this, 'POST', '/templates/merge', body);
	return wrapData(response);
}
