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
				resource: ['appointments'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new appointment',
				action: 'Create an appointment',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete an appointment',
				action: 'Delete an appointment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an appointment',
				action: 'Get an appointment',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of appointments',
				action: 'Get many appointments',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update an appointment's details",
				action: 'Update an appointment',
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
