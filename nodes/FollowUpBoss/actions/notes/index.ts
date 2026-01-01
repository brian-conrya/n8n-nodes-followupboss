import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as del from './delete.operation';
import * as get from './get.operation';
import * as update from './update.operation';

export { create, del as delete, get, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['notes'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a note',
				action: 'Create a note',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a note',
				action: 'Delete a note',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get notes',
				action: 'Get notes',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a note',
				action: 'Update a note',
			},
		],
		default: 'create',
	},
	...update.description,
	...create.description,
	...del.description,
	...get.description,
];
