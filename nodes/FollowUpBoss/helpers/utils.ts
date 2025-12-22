
import type {
	IDataObject,
	IDisplayOptions,
	INode,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const INT32_MIN = -2147483648;
const INT32_MAX = 2147483647;

/**
 * Parses a string ID to an Int32 number with validation.
 * Throws NodeOperationError if the value is not a valid Int32.
 */
export function toInt(
	value: string,
	fieldName: string,
	node: INode,
	itemIndex: number,
): number {
	const parsed = parseInt(value, 10);

	if (isNaN(parsed)) {
		throw new NodeOperationError(
			node,
			`${fieldName} must be a valid number. Got: "${value}"`,
			{ itemIndex },
		);
	}

	if (parsed < INT32_MIN || parsed > INT32_MAX) {
		throw new NodeOperationError(
			node,
			`${fieldName} must be a valid Int32 (between ${INT32_MIN} and ${INT32_MAX}). Got: ${parsed}`,
			{ itemIndex },
		);
	}

	return parsed;
}

/**
 * Parses an optional string to a float number.
 * Returns undefined if value is empty/null/undefined.
 * Throws NodeOperationError if value is present but not a valid number.
 */
export function toFloat(
	value: string | undefined | null,
	fieldName: string,
	node: INode,
	itemIndex: number,
): number | undefined {
	if (value === undefined || value === null || value === '') {
		return undefined;
	}

	const parsed = parseFloat(value);

	if (isNaN(parsed)) {
		throw new NodeOperationError(
			node,
			`${fieldName} must be a valid number. Got: "${value}"`,
			{ itemIndex },
		);
	}

	return parsed;
}


/**
 * Simple deep merge function to avoid external dependencies like lodash
 */
function deepMerge(target: IDataObject, source: IDataObject): IDataObject {
	if (typeof target !== 'object' || target === null || typeof source !== 'object' || source === null) {
		return source;
	}

	const result = { ...target };
	for (const key of Object.keys(source)) {
		const sourceValue = source[key];
		const targetValue = result[key];

		if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
			result[key] = [...targetValue, ...sourceValue];
		} else if (
			typeof sourceValue === 'object' &&
			sourceValue !== null &&
			typeof targetValue === 'object' &&
			targetValue !== null
		) {
			result[key] = deepMerge(targetValue as IDataObject, sourceValue as IDataObject);
		} else {
			result[key] = sourceValue;
		}
	}
	return result;
}

export function updateDisplayOptions(
	displayOptions: IDisplayOptions,
	properties: INodeProperties[],
) {
	return properties.map((nodeProperty) => {
		return {
			...nodeProperty,
			displayOptions: deepMerge(
				(nodeProperty.displayOptions || {}) as IDataObject,
				displayOptions as unknown as IDataObject,
			),
		};
	});
}

export function wrapData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
	if (!Array.isArray(data)) {
		return [{ json: data }];
	}
	return data.map((item) => ({
		json: item,
	}));
}

export function getCommonFiltersProperties(): INodeProperties[] {
	return [
		{
			displayName: 'Created After',
			name: 'createdAfter',
			type: 'dateTime',
			default: '',
			description: 'Filter records created after a given date/time',
		},
		{
			displayName: 'Created Before',
			name: 'createdBefore',
			type: 'dateTime',
			default: '',
			description: 'Filter records created before a given date/time',
		},
		{
			displayName: 'ID Greater Than',
			name: 'idGreaterThan',
			type: 'number',
			default: 0,
			description: 'Filter records with an ID greater than the specified value',
		},
		{
			displayName: 'ID Less Than',
			name: 'idLessThan',
			type: 'number',
			default: 0,
			description: 'Filter records with an ID less than the specified value',
		},
		{
			displayName: 'IDs',
			name: 'ids',
			type: 'string',
			default: '',
			description: 'A comma-separated list of IDs to retrieve',
			placeholder: 'e.g. 1,2,3',
		},

		{
			displayName: 'Updated After',
			name: 'updatedAfter',
			type: 'dateTime',
			default: '',
			description: 'Filter records updated after a given date/time',
		},
		{
			displayName: 'Updated Before',
			name: 'updatedBefore',
			type: 'dateTime',
			default: '',
			description: 'Filter records updated before a given date/time',
		},
	];
}

export function getPersonIdProperty(): INodeProperties {
	return {
		displayName: 'Person',
		name: 'personId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		modes: [
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: '123',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '[0-9]+',
							errorMessage: 'Not a valid Person ID',
						},
					},
				],
			},
			{
				displayName: 'By URL',
				name: 'url',
				type: 'string',
				placeholder: 'https://subdomain.followupboss.com/2/people/view/123',
				extractValue: {
					type: 'regex',
					regex: 'https://.*\\.followupboss\\.com/.*people/view/(\\d+)',
				},
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				placeholder: 'Select a person...',
				typeOptions: {
					searchListMethod: 'getPeople',
					searchFilterRequired: true,
					searchable: true,
				},
			},
		],
	};
}

export function getTaskIdProperty(): INodeProperties {
	return {
		displayName: 'Task ID',
		name: 'taskId',
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required: true,
		modes: [
			{
				displayName: 'By ID',
				name: 'id',
				type: 'string',
				placeholder: '123',
				validation: [
					{
						type: 'regex',
						properties: {
							regex: '[0-9]+',
							errorMessage: 'Not a valid Task ID',
						},
					},
				],
			},
			{
				displayName: 'From list',
				name: 'list',
				type: 'list',
				placeholder: 'Select a task...',
				typeOptions: {
					searchListMethod: 'getTasks',
					searchFilterRequired: true,
					searchable: true,
				},
			},
		],
	};
}

export function addCommonParameters(
	options: IDataObject,
	qs: IDataObject,
	sort?: IDataObject,
) {
	if (options.ids) qs.ids = options.ids;
	if (options.idLessThan) qs.idLessThan = options.idLessThan;
	if (options.idGreaterThan) qs.idGreaterThan = options.idGreaterThan;
	if (options.createdAfter) qs.createdAfter = options.createdAfter;
	if (options.createdBefore) qs.createdBefore = options.createdBefore;
	if (options.updatedAfter) qs.updatedAfter = options.updatedAfter;
	if (options.updatedBefore) qs.updatedBefore = options.updatedBefore;

	if (sort && sort.value) {
		const sortValue = sort.value as IDataObject;
		const direction = sortValue.direction as string;
		const field = sortValue.field as string;
		qs.sort = direction === 'desc' ? `-${field}` : field;
	}
}

export function simplifyItems(
	items: IDataObject | IDataObject[],
	fields: string[],
): IDataObject | IDataObject[] {
	if (!Array.isArray(items)) {
		const simplified: IDataObject = {};
		for (const field of fields) {
			if (items[field] !== undefined) {
				simplified[field] = items[field];
			}
		}
		return simplified;
	}

	return items.map((item) => {
		const simplified: IDataObject = {};
		for (const field of fields) {
			if (item[field] !== undefined) {
				simplified[field] = item[field];
			}
		}
		return simplified;
	});
}

export function getReturnAllProperties(): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			default: false,
			description: 'Whether to return all results or only up to a given limit',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: {
				show: {
					returnAll: [false],
				},
			},
			typeOptions: {
				minValue: 1,
			},
			default: 50,
			description: 'Max number of results to return',
		},
	];
}

interface IGetAllDescriptionOptions {
	resource: string;
	resourceSpecificOptions?: INodeProperties[];
}

export function createGetAllOperationDescription(
	options: IGetAllDescriptionOptions,
): INodeProperties[] {
	const { resource, resourceSpecificOptions = [] } = options;

	const displayOptions = {
		show: {
			resource: [resource],
			operation: ['getAll'],
		},
	};

	const allOptions = [...getCommonFiltersProperties(), ...resourceSpecificOptions].sort((a, b) =>
		a.displayName.localeCompare(b.displayName),
	);

	const description: INodeProperties[] = [
		...updateDisplayOptions(displayOptions, getReturnAllProperties()),
		{
			displayName: 'Options',
			name: 'options',
			type: 'collection' as const,
			placeholder: 'Add Option',
			default: {},
			displayOptions,
			options: allOptions,
		},
		{
			displayName: 'Sort',
			name: 'sort',
			type: 'fixedCollection',
			displayOptions,
			placeholder: 'Add Sort Rule',
			default: {},
			options: [
				{
					displayName: 'Sort',
					name: 'value',
					values: [
						{
							displayName: 'Field',
							name: 'field',
							type: 'string',
							default: 'created',
							description: 'The field to sort by',
						},
						{
							displayName: 'Direction',
							name: 'direction',
							type: 'options',
							options: [
								{
									name: 'Ascending',
									value: 'asc',
								},
								{
									name: 'Descending',
									value: 'desc',
								},
							],
							default: 'desc',
							description: 'The direction to sort the results in',
						},
					],
				},
			],
		},
	];

	return description;
}

export function wrapDeleteSuccess(): INodeExecutionData[] {
	return [{ json: { deleted: true } }];
}

export function flattenPersonContactInfo(person: IDataObject): IDataObject {
	const newPerson = { ...person };
	if (newPerson.emails && Array.isArray(newPerson.emails) && newPerson.emails.length > 0) {
		newPerson.email = (newPerson.emails[0] as IDataObject).value;
	}
	if (newPerson.phones && Array.isArray(newPerson.phones) && newPerson.phones.length > 0) {
		newPerson.phone = (newPerson.phones[0] as IDataObject).value;
	}
	return newPerson;
}
