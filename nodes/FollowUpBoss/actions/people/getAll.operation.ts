import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	wrapData,
	toFloat,
	simplifyItems,
	flattenPersonContactInfo,
	getStageIdProperty,
	getUserIdProperty,
	getPondIdProperty,
	getLenderIdProperty,
	getSmartListIdProperty,
	getCustomFieldNameProperty,
} from '../../helpers/utils';

export const description: INodeProperties[] = [
	...createGetAllOperationDescription({
		resource: 'people',
		resourceSpecificOptions: [
			{
				displayName: 'Include Trash',
				name: 'includeTrash',
				type: 'boolean',
				default: false,
				description: 'Whether to include people in the "trash" stage',
			},
			{
				displayName: 'Include Unclaimed',
				name: 'includeUnclaimed',
				type: 'boolean',
				default: false,
				description: 'Whether to include unclaimed leads offered to the current user',
			},
			{
				displayName: 'Last Activity After',
				name: 'lastActivityAfter',
				type: 'dateTime',
				default: '',
				description: 'Search for last activity after a given time',
			},
			{
				displayName: 'Last Activity Before',
				name: 'lastActivityBefore',
				type: 'dateTime',
				default: '',
				description: 'Search for last activity before a given time',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Search for person with a name like what is given',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				default: '',
				description: 'Search for person with a first name like what is given',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				default: '',
				description: 'Search for person with a last name like what is given',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'Search for a person by email address',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Search for a person by phone number',
			},
			{
				...getStageIdProperty(false, 'stage'),
				description:
					'Search for person by stage name. Choose from the list, or specify a stage name.',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'Search for a person by lead source',
			},
			{
				displayName: 'Assigned To',
				name: 'assignedTo',
				type: 'string',
				default: '',
				description: 'Search for a person by the user that is assigned to them',
			},
			{
				...getUserIdProperty('Assigned User', 'assignedUserId', false),
				description:
					'Search for people by the assigned user ID. Choose from the list, or specify an ID.',
			},
			{
				...getPondIdProperty(false),
				name: 'assignedPondId',
				description:
					'Search for a person by the assigned pond ID. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'Assigned Lender Name',
				name: 'assignedLenderName',
				type: 'string',
				default: '',
				description: 'Search for people by the assigned lender name',
			},
			{
				...getLenderIdProperty('Assigned Lender', 'assignedLenderId', false),
				description:
					'Search for people by the assigned lender user ID. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'Contacted',
				name: 'contacted',
				type: 'boolean',
				default: false,
				description: 'Whether the person has been contacted',
			},
			{
				displayName: 'Price Above',
				name: 'priceAbove',
				type: 'string',
				default: '',
				description: 'Search for people who have specified a price above a given value',
			},
			{
				displayName: 'Price Below',
				name: 'priceBelow',
				type: 'string',
				default: '',
				description: 'Search for people who have specified a price below a given value',
			},
			{
				...getSmartListIdProperty(false, 'smartListId'),
				description:
					'Search for people that match a smart list with given ID. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Search for people that match one or more tags (comma-separated)',
			},
			{
				displayName: 'Custom Fields',
				name: 'customFields',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
				placeholder: 'Add Custom Field Filter',
				options: [
					{
						displayName: 'Field',
						name: 'customField',
						values: [
							{
								...getCustomFieldNameProperty(true, 'key'),
								description:
									'Name of the custom field (with or without "custom" prefix). Choose from the list, or specify an ID.',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								description: 'Value to filter by',
							},
						],
					},
				],
			},
		],
	}),
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: false,
		description: 'Whether to return a simplified version of the response instead of the raw data',
		displayOptions: {
			show: {
				resource: ['people'],
				operation: ['getAll'],
			},
		},
	},
];

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const simplify = this.getNodeParameter('simplify', i) as boolean;
	const qs: IDataObject = { fields: 'allFields' };
	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;

	addCommonParameters(options, qs, sort);

	if (options.includeTrash) qs.includeTrash = options.includeTrash;
	if (options.includeUnclaimed) qs.includeUnclaimed = options.includeUnclaimed;
	if (options.lastActivityAfter) qs.lastActivityAfter = options.lastActivityAfter;
	if (options.lastActivityBefore) qs.lastActivityBefore = options.lastActivityBefore;
	if (options.name) qs.name = options.name;
	if (options.firstName) qs.firstName = options.firstName;
	if (options.lastName) qs.lastName = options.lastName;
	if (options.email) qs.email = options.email;
	if (options.phone) qs.phone = options.phone;
	if (options.stage) qs.stage = options.stage;
	if (options.source) qs.source = options.source;
	if (options.assignedTo) qs.assignedTo = options.assignedTo;
	if (options.assignedUserId) qs.assignedUserId = options.assignedUserId;
	if (options.assignedPondId) qs.assignedPondId = options.assignedPondId;
	if (options.assignedLenderName) qs.assignedLenderName = options.assignedLenderName;
	if (options.assignedLenderId) qs.assignedLenderId = options.assignedLenderId;
	if (options.contacted !== undefined) qs.contacted = options.contacted;
	if (options.priceAbove)
		qs.priceAbove = toFloat(options.priceAbove as string, 'Price Above', this.getNode(), i);
	if (options.priceBelow)
		qs.priceBelow = toFloat(options.priceBelow as string, 'Price Below', this.getNode(), i);
	if (options.smartListId) qs.smartListId = options.smartListId;
	if (options.tags) qs.tags = options.tags;

	// Handle custom fields
	if (options.customFields) {
		const customFields = (options.customFields as IDataObject).customField as IDataObject[];
		if (customFields) {
			for (const field of customFields) {
				let key = field.key as string;
				if (!key.startsWith('custom')) {
					key = `custom${key.charAt(0).toUpperCase() + key.slice(1)}`;
				}
				qs[key] = field.value;
			}
		}
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const response = await apiRequestAllItems.call(this, '/people', qs, limit);

	if (simplify) {
		const transformedData = response.map((item: IDataObject) => flattenPersonContactInfo(item));

		const simplifiedData = simplifyItems(
			transformedData,
			'id,firstName,lastName,email,phone,stage,tags,source,created,updated'.split(','),
		);
		return wrapData(simplifiedData, i);
	}

	return wrapData(response, i);
}
