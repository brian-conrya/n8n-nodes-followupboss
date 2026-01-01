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
				resource: ['deals'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new deal record',
				action: 'Create a deal',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a deal',
				action: 'Delete a deal',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a deal by ID',
				action: 'Get a deal',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of deals',
				action: 'Get many deals',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update a deal's details",
				action: 'Update a deal',
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
