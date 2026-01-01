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
				resource: ['personAttachments'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new person attachment',
				action: 'Create a person attachment',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a person attachment',
				action: 'Delete a person attachment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a person attachment',
				action: 'Get a person attachment',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a person attachment',
				action: 'Update a person attachment',
			},
		],
		default: 'create',
	},
	...create.description,
	...del.description,
	...get.description,
	...update.description,
];
