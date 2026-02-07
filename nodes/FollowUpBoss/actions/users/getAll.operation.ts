import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	wrapData,
} from '../../helpers/utils';

const resource = 'users';

const resourceSpecificOptions: INodeProperties[] = [
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'user@example.com',
		default: '',
		description: 'Find a user by their email address',
	},
	{
		displayName: 'Fields',
		name: 'fields',
		type: 'string',
		default: '',
		placeholder: 'id,name,email',
		description:
			'Comma-separated list of fields to return, or use "allFields" to return all fields',
	},
	{
		displayName: 'Include Deleted',
		name: 'includeDeleted',
		type: 'boolean',
		default: false,
		description: 'Whether to include users that have been deleted',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		description: 'Find a user by their full name (exact matches only)',
	},
	{
		displayName: 'Role',
		name: 'role',
		type: 'options',
		options: [
			{
				name: 'Agent',
				value: 'Agent',
			},
			{
				name: 'Broker',
				value: 'Broker',
			},
			{
				name: 'Lender',
				value: 'Lender',
			},
		],
		typeOptions: {
			allowCustomValue: true,
		},
		default: 'Agent',
		description:
			'Find users by a specific role or a comma-separated list of roles (e.g. Broker,Agent)',
	},
];

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions,
});

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;

	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	// Add filter options to query string
	if (options.role) {
		qs.role = options.role;
	}
	if (options.name) {
		qs.name = options.name;
	}
	if (options.email) {
		qs.email = options.email;
	}
	if (options.fields) {
		qs.fields = options.fields;
	}
	if (options.includeDeleted) {
		qs.includeDeleted = true;
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const response = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);
	return wrapData(response, i);
}
