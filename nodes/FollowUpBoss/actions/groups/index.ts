import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as del from './delete.operation';
import * as get from './get.operation';
import * as getAll from './getAll.operation';
import * as roundRobin from './roundRobin.operation';
import * as update from './update.operation';

export { create, del as delete, get, getAll, roundRobin, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['groups'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new group',
				action: 'Create a group',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a group',
				action: 'Delete a group',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a group by ID',
				action: 'Get a group',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of groups',
				action: 'Get many groups',
			},
			{
				name: 'Get Round Robin Groups',
				value: 'roundRobin',
				description: 'Get all round robin groups',
				action: 'Get round robin groups',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update a group's details",
				action: 'Update a group',
			},
		],
		default: 'create',
	},
	...update.description,
	...create.description,
	...getAll.description,
	...del.description,
	...get.description,
	...roundRobin.description,
];
