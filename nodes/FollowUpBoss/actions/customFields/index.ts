import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as del from './delete.operation';
import * as get from './get.operation';
import * as getAll from './getAll.operation';
import * as update from './update.operation';

export { create, del as delete, get, getAll, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customFields'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new custom field',
				action: 'Create a custom field',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a custom field',
				action: 'Delete a custom field',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a custom field',
				action: 'Get a custom field',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of custom fields',
				action: 'Get many custom fields',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update a custom field's details",
				action: 'Update a custom field',
			},
		],
		default: 'create',
	},
	...update.description,
	...create.description,
	...getAll.description,
	...del.description,
	...get.description,
];
