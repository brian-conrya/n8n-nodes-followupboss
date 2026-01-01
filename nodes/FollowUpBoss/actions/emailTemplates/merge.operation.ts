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
		operation: ['merge'],
	},
};

const properties: INodeProperties[] = [
	{
		...getEmailTemplateIdProperty(),
		description: 'ID of the template to merge. Choose from the list, or specify an ID.',
	},
	{
		...getPersonIdProperty(),
		displayName: 'Merge Person',
		name: 'mergePersonId',
		required: false,
		description:
			'Person ID to use for merge fields like %contact_name%. Choose from the list, or specify an ID.',
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

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const templateIdRaw = (this.getNodeParameter('templateId', i) as IDataObject).value as string;
	const templateId = toInt(templateIdRaw, 'Email Template ID', this.getNode(), i);
	const mergePersonIdRaw = (this.getNodeParameter('mergePersonId', i, { value: '' }) as IDataObject)
		.value as string;
	const recipients = this.getNodeParameter('recipients', i) as IDataObject;

	const body: IDataObject = { templateId };

	if (mergePersonIdRaw) {
		body.mergePersonId = toInt(mergePersonIdRaw, 'Merge Person ID', this.getNode(), i);
	}

	if (recipients && recipients.to) {
		body.recipients = {
			to: recipients.to,
		};
	}

	const response = await apiRequest.call(this, 'POST', '/templates/merge', body);
	return wrapData(response);
}
