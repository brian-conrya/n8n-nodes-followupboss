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
				resource: ['ponds'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new pond',
				action: 'Create a pond',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a pond',
				action: 'Delete a pond',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a pond',
				action: 'Get a pond',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of ponds',
				action: 'Get many ponds',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update a pond's details",
				action: 'Update a pond',
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
