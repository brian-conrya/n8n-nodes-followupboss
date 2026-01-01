import { INodeProperties } from 'n8n-workflow';

import * as complete from './complete.operation';
import * as create from './create.operation';
import * as del from './delete.operation';
import * as get from './get.operation';
import * as getAll from './getAll.operation';
import * as update from './update.operation';

export { complete, create, del as delete, get, getAll, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['tasks'],
			},
		},
		options: [
			{
				name: 'Complete',
				value: 'complete',
				description: 'Complete a task',
				action: 'Complete a task',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new task',
				action: 'Create a task',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a task',
				action: 'Delete a task',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a task by ID',
				action: 'Get a task',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of tasks',
				action: 'Get many tasks',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update a task's details",
				action: 'Update a task',
			},
		],
		default: 'create',
	},
	...update.description,
	...create.description,
	...getAll.description,
	...complete.description,
	...del.description,
	...get.description,
];
