import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as del from './delete.operation';
import * as getAll from './getAll.operation';

import * as get from './get.operation';
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
				resource: ['appointmentTypes'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new appointment type',
				action: 'Create an appointment type',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete an appointment type',
				action: 'Delete an appointment type',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an appointment type',
				action: 'Get an appointment type',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of appointment types',
				action: 'Get many appointment types',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an appointment type',
				action: 'Update an appointment type',
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
