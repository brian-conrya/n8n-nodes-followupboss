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
				resource: ['dealAttachments'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a deal attachment',
				action: 'Create a deal attachment',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a deal attachment',
				action: 'Delete a deal attachment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a deal attachment',
				action: 'Get a deal attachment',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a deal attachment',
				action: 'Update a deal attachment',
			},
		],
		default: 'create',
	},
	...create.description,
	...del.description,
	...get.description,
	...update.description,
];
