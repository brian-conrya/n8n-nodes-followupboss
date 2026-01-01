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
				resource: ['dealCustomFields'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new deal custom field',
				action: 'Create a deal custom field',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a deal custom field',
				action: 'Delete a deal custom field',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a deal custom field',
				action: 'Get a deal custom field',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of deal custom fields',
				action: 'Get many deal custom fields',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update a deal custom field's details",
				action: 'Update a deal custom field',
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
