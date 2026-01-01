import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['dealCustomFields'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Label',
		name: 'label',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'Birthday',
		description: 'The user-friendly name of the custom field (e.g., "Anniversary")',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: [
			{ name: 'Date', value: 'date' },
			{ name: 'Dropdown', value: 'dropdown' },
			{ name: 'Number', value: 'number' },
			{ name: 'Text', value: 'text' },
		],
		default: 'text',
		required: true,
		description: 'The type of custom field',
	},
	{
		displayName: 'Choices',
		name: 'choices',
		type: 'string',
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		displayOptions: {
			show: {
				type: ['dropdown'],
			},
		},
		description: 'Array of options related to a custom field of type dropdown',
	},
	{
		displayName: 'Hide If Empty',
		name: 'hideIfEmpty',
		type: 'boolean',
		default: false,
		description: 'Whether to hide this field when viewing a person if it is empty',
	},
	{
		displayName: 'Is Recurring',
		name: 'isRecurring',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				type: ['date'],
			},
		},
		description: 'Whether a date field occurs every year (e.g. birthdays, anniversaries, etc.)',
	},
	{
		displayName: 'Order Weight',
		name: 'orderWeight',
		type: 'number',
		default: 0,
		placeholder: '0',
		description: 'A weighted integer for the field to assign values for custom sorting',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const label = this.getNodeParameter('label', i) as string;
	const type = this.getNodeParameter('type', i) as string;
	const hideIfEmpty = this.getNodeParameter('hideIfEmpty', i) as boolean;
	const orderWeight = this.getNodeParameter('orderWeight', i) as number;

	const body: IDataObject = {
		label,
		type,
	};

	if (type === 'dropdown') {
		const choices = this.getNodeParameter('choices', i) as string[];
		if (choices && choices.length > 0) {
			body.choices = choices;
		}
	}

	if (type === 'date') {
		const isRecurring = this.getNodeParameter('isRecurring', i) as boolean;
		body.isRecurring = isRecurring;
	}

	if (hideIfEmpty) {
		body.hideIfEmpty = hideIfEmpty;
	}

	if (orderWeight !== 0) {
		body.orderWeight = orderWeight;
	}

	const response = await apiRequest.call(this, 'POST', '/dealCustomFields', body);
	return wrapData(response);
}
