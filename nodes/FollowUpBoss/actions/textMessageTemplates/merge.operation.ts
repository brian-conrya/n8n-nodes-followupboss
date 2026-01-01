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
	getPersonIdProperty,
	getTextMessageTemplateIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['textMessageTemplates'],
		operation: ['merge'],
	},
};

const properties: INodeProperties[] = [
	{
		...getTextMessageTemplateIdProperty(true, 'templateId'),
		description: 'ID of the template to merge. Choose from the list, or specify an ID.',
	},
	{
		...getPersonIdProperty(false),
		description: 'ID of the person to merge with. Choose from the list, or specify an ID.',
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

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const templateIdRaw = (this.getNodeParameter('templateId', i) as IDataObject).value as string;
	const templateId = toInt(templateIdRaw, 'Text Message Template ID', this.getNode(), i);
	const personIdParam = this.getNodeParameter('personId', i, { value: '' }) as IDataObject;
	const personIdRaw = personIdParam.value as string;
	const recipients = this.getNodeParameter('recipients', i, {}) as {
		to?: Array<{ name: string; phone: string }>;
	};

	const body: {
		templateId: number;
		personId?: number;
		recipients?: { to: Array<{ name: string; phone: string }> };
	} = {
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
