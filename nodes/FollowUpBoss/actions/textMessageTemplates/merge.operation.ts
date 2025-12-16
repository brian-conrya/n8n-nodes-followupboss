import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['textMessageTemplates'],
		operation: ['merge'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Template Name or ID',
		name: 'templateId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getTextMessageTemplates',
		},
		default: '',
		required: true,
		description:
			'ID of the template to merge. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Person ID',
		name: 'personId',
		type: 'string',
		default: '',
		description: 'ID of the person to merge with',
	},
	{
		displayName: 'Recipients',
		name: 'recipients',
		type: 'fixedCollection',
		default: {},
		typeOptions: {
			multipleValues: true,
		},
		options: [
			{
				name: 'to',
				displayName: 'To',
				values: [
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Name of the recipient',
					},
					{
						displayName: 'Phone',
						name: 'phone',
						type: 'string',
						default: '',
						description: 'Phone number of the recipient',
					},
				],
			},
		],
		description: 'List of recipients of this text message',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const templateId = toInt(this.getNodeParameter('templateId', i) as string, 'Template ID', this.getNode(), i);
	const personIdRaw = this.getNodeParameter('personId', i) as string;
	const recipients = this.getNodeParameter('recipients', i, {}) as {
		to?: Array<{ name: string; phone: string }>;
	};

	const body: { templateId: number; personId?: number; recipients?: { to: Array<{ name: string; phone: string }> } } =
	{
		templateId,
	};

	if (personIdRaw) {
		body.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	}

	if (recipients.to) {
		body.recipients = recipients as { to: Array<{ name: string; phone: string }> };
	}

	const response = await apiRequest.call(this, 'POST', '/textMessageTemplates/merge', body);
	return wrapData(response);
}
