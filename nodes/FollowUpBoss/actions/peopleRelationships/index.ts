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
				resource: ['peopleRelationships'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new people relationship',
				action: 'Create a people relationship',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a people relationship',
				action: 'Delete a people relationship',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a people relationship',
				action: 'Get a people relationship',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of people relationships',
				action: 'Get many people relationships',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a people relationship',
				action: 'Update a people relationship',
			},
		],
		default: 'create',
	},
	...create.description,
	...del.description,
	...get.description,
	...getAll.description,
	...update.description,
];
