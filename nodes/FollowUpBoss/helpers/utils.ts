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
export function toInt(value: string, fieldName: string, node: INode, itemIndex: number): number {
	const parsed = parseInt(value, 10);

	if (isNaN(parsed)) {
		throw new NodeOperationError(node, `${fieldName} must be a valid number. Got: "${value}"`, {
			itemIndex,
		});
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
		throw new NodeOperationError(node, `${fieldName} must be a valid number. Got: "${value}"`, {
			itemIndex,
		});
	}

	return parsed;
}

/**
 * Simple deep merge function to avoid external dependencies like lodash
 */
function deepMerge(target: IDataObject, source: IDataObject): IDataObject {
	if (
		typeof target !== 'object' ||
		target === null ||
		typeof source !== 'object' ||
		source === null
	) {
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

export function wrapData(
	data: IDataObject | IDataObject[],
	itemIndex?: number,
): INodeExecutionData[] {
	if (!Array.isArray(data)) {
		return [{ json: data, pairedItem: itemIndex !== undefined ? { item: itemIndex } : undefined }];
	}
	return data.map((item) => ({
		json: item,
		pairedItem: itemIndex !== undefined ? { item: itemIndex } : undefined,
	}));
}

export function getCommonFiltersProperties(includeDates = true): INodeProperties[] {
	const properties: INodeProperties[] = [
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
	];

	if (includeDates) {
		properties.push(
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
		);
	}

	return properties;
}

export interface IResourceLocatorOptions {
	displayName: string;
	name: string;
	searchListMethod: string;
	placeholder?: string;
	required?: boolean;
	urlRegex?: string;
	urlPlaceholder?: string;
	isNumericId?: boolean;
	searchable?: boolean;
}

export function getResourceLocatorProperty(options: IResourceLocatorOptions): INodeProperties {
	const {
		displayName,
		name,
		searchListMethod,
		placeholder,
		required = true,
		urlRegex,
		urlPlaceholder,
		isNumericId = true,
	} = options;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const modes: Array<Record<string, any>> = [
		{
			displayName: 'By ID',
			name: 'id',
			type: 'string',
			default: '',
			placeholder: isNumericId ? '123' : 'e.g. Stage Name',
			validation: isNumericId
				? [
					{
						type: 'regex',
						properties: {
							regex: '[0-9]+',
							errorMessage: `Not a valid ${displayName} ID`,
						},
					},
				]
				: [],
		},
	];

	if (urlRegex) {
		modes.push({
			displayName: 'By URL',
			name: 'url',
			type: 'string',
			default: '',
			placeholder: urlPlaceholder || 'https://...',
			extractValue: {
				type: 'regex',
				regex: urlRegex,
			},
		});
	}

	modes.push({
		displayName: 'From list',
		name: 'list',
		type: 'list',
		default: '',
		placeholder: placeholder || `Select a ${displayName.toLowerCase()}...`,
		typeOptions: {
			searchListMethod,
			searchable: options.searchable ?? true,
		},
	});

	return {
		displayName,
		name,
		type: 'resourceLocator',
		default: { mode: 'list', value: '' },
		required,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		modes: modes as any,
	};
}

export function getPersonIdProperty(required = true, name = 'personId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Person',
		name,
		searchListMethod: 'getPeople',
		urlRegex: 'https://.*\\.followupboss\\.com/.*people/view/(\\d+)',
		urlPlaceholder: 'https://subdomain.followupboss.com/2/people/view/123',
		required,
	});
}

export function getUnclaimedPersonIdProperty(required = true, name = 'personId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Unclaimed Person',
		name,
		searchListMethod: 'getUnclaimedPeople',
		urlRegex: 'https://.*\\.followupboss\\.com/.*people/view/(\\d+)',
		urlPlaceholder: 'https://subdomain.followupboss.com/2/people/view/123',
		required,
	});
}

export function getTaskIdProperty(required = true, name = 'taskId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Task ID',
		name,
		searchListMethod: 'getTasks',
		required,
	});
}

export function getUserIdProperty(
	displayName = 'User',
	name = 'userId',
	required = true,
): INodeProperties {
	return getResourceLocatorProperty({
		displayName,
		name,
		searchListMethod: 'getUsers',
		required,
	});
}

export function getLenderIdProperty(
	displayName = 'Lender',
	name = 'lenderId',
	required = true,
): INodeProperties {
	return getResourceLocatorProperty({
		displayName,
		name,
		searchListMethod: 'getLenders',
		required,
		searchable: false,
	});
}

export function getAgentIdProperty(required = true, name = 'agentId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Agent',
		name,
		searchListMethod: 'getAgents',
		required,
	});
}

export function getPipelineIdProperty(required = true, name = 'pipelineId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Pipeline',
		name,
		searchListMethod: 'getPipelines',
		required,
		searchable: false,
	});
}

export function getSmartListIdProperty(required = true, name = 'smartListId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Smart List',
		name,
		searchListMethod: 'getSmartLists',
		required,
	});
}

export function getPipelineStageIdProperty(required = true, name = 'stageId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Stage',
		name,
		searchListMethod: 'getPipelineStages',
		required,
	});
}

export function getStageIdProperty(
	required = true,
	name = 'stage',
	isNumericId = false,
): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Stage',
		name,
		searchListMethod: 'getStages',
		required,
		isNumericId,
	});
}

export function getAppointmentTypeIdProperty(required = true, name = 'typeId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Appointment Type',
		name,
		searchListMethod: 'getAppointmentTypes',
		required,
		searchable: false,
	});
}

export function getTimeframeIdProperty(required = true, name = 'timeframeId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Timeframe',
		name,
		searchListMethod: 'getTimeframes',
		required,
	});
}

export function getAppointmentOutcomeIdProperty(
	required = true,
	name = 'outcomeId',
): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Appointment Outcome',
		name,
		searchListMethod: 'getAppointmentOutcomes',
		required,
		searchable: false,
	});
}

export function getActionPlanIdProperty(required = true, name = 'actionPlanId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Action Plan',
		name,
		searchListMethod: 'getActionPlans',
		required,
	});
}

export function getAutomationIdProperty(
	required = true,
	name = 'automationId',
	manualOnly = false,
): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Automation',
		name,
		searchListMethod: manualOnly ? 'getManualAutomations' : 'getAutomations',
		required,
	});
}

export function getPondIdProperty(required = true): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Pond',
		name: 'pondId',
		searchListMethod: 'getPonds',
		required,
		searchable: false,
	});
}

export function getGroupIdProperty(required = true, name = 'groupId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Group',
		name,
		searchListMethod: 'getGroups',
		required,
		searchable: false,
	});
}

export function getDealIdProperty(required = true): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Deal',
		name: 'dealId',
		searchListMethod: 'getDeals',
		required,
		searchable: false,
	});
}

export function getCallIdProperty(required = true, name = 'id'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Call',
		name,
		searchListMethod: 'getCalls',
		required,
		searchable: false,
	});
}

export function getTeamIdProperty(required = true, name = 'id'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Team',
		name,
		searchListMethod: 'getTeams',
		required,
		searchable: false,
	});
}

export function getEmailTemplateIdProperty(required = true, name = 'templateId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Template',
		name,
		searchListMethod: 'getEmailTemplates',
		required,
		searchable: false,
	});
}

export function getTextMessageTemplateIdProperty(
	required = true,
	name = 'templateId',
): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Text Message Template',
		name,
		searchListMethod: 'getTextMessageTemplates',
		required,
		searchable: false,
	});
}

export function getCustomFieldIdProperty(required = true, name = 'name'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Custom Field',
		name,
		searchListMethod: 'getCustomFields',
		isNumericId: true,
		required,
		searchable: false,
	});
}

export function getCustomFieldNameProperty(required = true, name = 'name'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Custom Field',
		name,
		searchListMethod: 'getCustomFieldNames',
		isNumericId: false,
		required,
		searchable: false,
	});
}

export function getDealCustomFieldIdProperty(required = true, name = 'name'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Deal Custom Field',
		name,
		searchListMethod: 'getDealCustomFields',
		isNumericId: true,
		required,
		searchable: false,
	});
}

export function getDealCustomFieldNameProperty(required = true, name = 'name'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Deal Custom Field',
		name,
		searchListMethod: 'getDealCustomFieldNames',
		isNumericId: false,
		required,
		searchable: false,
	});
}

export function getNoteIdProperty(required = true, name = 'noteId'): INodeProperties {
	return {
		displayName: 'Note ID',
		name,
		type: 'string',
		default: '',
		required,
	};
}

export function getEventIdProperty(required = true, name = 'eventId'): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Event',
		name,
		searchListMethod: 'getEvents',
		required,
		searchable: false,
	});
}

export function getRelationshipIdProperty(
	required = true,
	name = 'relationshipId',
): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Relationship',
		name,
		searchListMethod: 'getPeopleRelationships',
		required,
		searchable: false,
	});
}

export function getTextMessageIdProperty(required = true, name = 'textMessageId'): INodeProperties {
	return {
		displayName: 'Text Message ID',
		name,
		type: 'string',
		default: '',
		required,
	};
}

export function getReactionIdProperty(required = true, name = 'id'): INodeProperties {
	return {
		displayName: 'Reaction ID',
		name,
		type: 'string',
		default: '',
		required,
	};
}

export function getDealAttachmentIdProperty(
	required = true,
	name = 'attachmentId',
): INodeProperties {
	return {
		displayName: 'Attachment ID',
		name,
		type: 'string',
		default: '',
		required,
	};
}

export function getActionPlanPersonAssignmentIdProperty(
	required = true,
	name = 'id',
): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Assignment',
		name,
		searchListMethod: 'getActionPlansPeople',
		required,
		searchable: false,
	});
}

export function getEmailMarketingCampaignIdProperty(
	required = true,
	name = 'campaignId',
): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Campaign',
		name,
		searchListMethod: 'getEmailMarketingCampaigns',
		required,
		searchable: false,
	});
}

export function getPersonAttachmentIdProperty(required = true, name = 'id'): INodeProperties {
	return {
		displayName: 'Person Attachment ID',
		name,
		type: 'string',
		default: '',
		required,
	};
}

export function getThreadedReplyIdProperty(required = true, name = 'id'): INodeProperties {
	return {
		displayName: 'Threaded Reply ID',
		name,
		type: 'string',
		default: '',
		required,
	};
}

export function getAppointmentIdProperty(required = true): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Appointment',
		name: 'appointmentId',
		searchListMethod: 'getAppointments',
		required,
		searchable: false,
	});
}

export function getAutomationPersonAssignmentIdProperty(required = true): INodeProperties {
	return getResourceLocatorProperty({
		displayName: 'Assignment',
		name: 'id',
		searchListMethod: 'getAutomationsPeople',
		required,
		searchable: false,
	});
}

export function addCommonParameters(options: IDataObject, qs: IDataObject, sort?: IDataObject) {
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
	includeDates?: boolean;
}

export function createGetAllOperationDescription(
	options: IGetAllDescriptionOptions,
): INodeProperties[] {
	const { resource, resourceSpecificOptions = [], includeDates = true } = options;

	const displayOptions = {
		show: {
			resource: [resource],
			operation: ['getAll'],
		},
	};

	const allOptions = [...getCommonFiltersProperties(includeDates), ...resourceSpecificOptions].sort(
		(a, b) => a.displayName.localeCompare(b.displayName),
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

export function wrapCreateSuccess(): INodeExecutionData[] {
	return [{ json: { created: true } }];
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

export function getTagsProperty(displayName = 'Tags'): INodeProperties[] {
	return [
		{
			displayName: 'Tags Input Mode',
			name: 'tagsMode',
			type: 'options',
			default: 'manual',
			description: 'Choose how to provide the tags',
			options: [
				{
					name: 'Manual (One Per Line)',
					value: 'manual',
					description: 'Best for static tags or copy-pasting from Excel',
				},
				{
					name: 'Map / JSON Array',
					value: 'json',
					description: 'Best for dynamic arrays from previous nodes',
				},
			],
		},
		{
			displayName,
			name: 'tagsManual',
			type: 'string',
			typeOptions: {
				rows: 4,
			},
			displayOptions: {
				show: {
					tagsMode: ['manual'],
				},
			},
			default: '',
			placeholder: 'Lead\nSource: Zillow, Trulia\n2025 Prospect',
			description: 'Enter one tag per line. Commas inside lines are preserved.',
		},
		{
			displayName: `${displayName} (JSON)`,
			name: 'tagsJson',
			type: 'json',
			displayOptions: {
				show: {
					tagsMode: ['json'],
				},
			},
			default: '',
			description: 'Map an array of strings here (e.g., {{ $JSON.tags }})',
		},
	];
}

export function normalizeTags(
	tagsMode: string,
	tagsManual: string | undefined,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	tagsJson: any,
): string[] {
	if (tagsMode === 'manual') {
		return (tagsManual || '')
			.split('\n')
			.map((tag) => tag.trim())
			.filter((tag) => tag.length > 0);
	} else if (tagsMode === 'json') {
		if (Array.isArray(tagsJson)) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return tagsJson.map((tag: any) => String(tag));
		} else if (tagsJson !== null && tagsJson !== undefined && tagsJson !== '') {
			return [String(tagsJson)];
		}
	}
	return [];
}
