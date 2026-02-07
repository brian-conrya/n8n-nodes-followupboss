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
	getDealCustomFieldIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['dealCustomFields'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getDealCustomFieldIdProperty(true, 'id'),
		description:
			'The ID of the deal custom field to update. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Choices',
				name: 'choices',
				type: 'string',
				typeOptions: {
					multipleValues: true,
				},
				default: [],
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
				description: 'Whether a date field occurs every year (e.g. birthdays, anniversaries, etc.)',
			},
			{
				displayName: 'Label',
				name: 'label',
				type: 'string',
				default: '',
				description: 'The user-friendly name of the custom field (e.g., "Anniversary")',
			},
			{
				displayName: 'Order Weight',
				name: 'orderWeight',
				type: 'number',
				default: 0,
				placeholder: '0',
				description: 'A weighted integer for the field to assign values for custom sorting',
			},
		],
	},
	{
		displayName: 'Dropdown Choice Map',
		name: 'dropdownChoiceMap',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		description:
			'An optional mapping that points previous dropdown choices (keys) to their new positions (values). This is used to track when options get moved or renamed. If items are missing from the keys, they will be removed.',
		options: [
			{
				displayName: 'Mappings',
				name: 'mappings',
				values: [
					{
						displayName: 'From Position',
						name: 'from',
						type: 'number',
						default: 0,
						description: 'The previous position (index) of the dropdown choice',
					},
					{
						displayName: 'To Position',
						name: 'to',
						type: 'number',
						default: 0,
						description: 'The new position (index) for the dropdown choice',
					},
				],
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Deal Custom Field ID', this.getNode(), i);
	const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
	const choices = updateFields.choices as string[];
	const hideIfEmpty = updateFields.hideIfEmpty as boolean;
	const isRecurring = updateFields.isRecurring as boolean;
	const label = updateFields.label as string;
	const orderWeight = updateFields.orderWeight as number;
	const dropdownChoiceMapData = this.getNodeParameter('dropdownChoiceMap', i, {}) as IDataObject;

	const body: IDataObject = {};

	if (choices && choices.length > 0) {
		body.choices = choices;
	}

	if (dropdownChoiceMapData.mappings) {
		const mappings = dropdownChoiceMapData.mappings as IDataObject[];
		if (mappings.length > 0) {
			const choiceMap: number[] = [];
			for (const mapping of mappings) {
				choiceMap[mapping.from as number] = mapping.to as number;
			}
			body.dropdownChoiceMap = choiceMap;
		}
	}

	if (hideIfEmpty) {
		body.hideIfEmpty = hideIfEmpty;
	}

	if (isRecurring) {
		body.isRecurring = isRecurring;
	}

	if (label) {
		body.label = label;
	}

	if (orderWeight !== 0) {
		body.orderWeight = orderWeight;
	}

	const response = await apiRequest.call(this, 'PUT', `/dealCustomFields/${id}`, body);
	return wrapData(response, i);
}
