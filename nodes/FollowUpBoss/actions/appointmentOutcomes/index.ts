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
				resource: ['appointmentOutcomes'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new appointment outcome',
				action: 'Create an appointment outcome',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete an appointment outcome',
				action: 'Delete an appointment outcome',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an appointment outcome',
				action: 'Get an appointment outcome',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of appointment outcomes',
				action: 'Get many appointment outcomes',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update to an appointment outcome',
				action: 'Update an appointment outcome',
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
