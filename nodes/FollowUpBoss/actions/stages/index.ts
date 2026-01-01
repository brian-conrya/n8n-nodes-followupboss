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
				resource: ['stages'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new stage',
				action: 'Create a stage',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a stage',
				action: 'Delete a stage',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a stage by ID',
				action: 'Get a stage',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of stages',
				action: 'Get many stages',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update a stage's details",
				action: 'Update a stage',
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
