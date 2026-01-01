import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as del from './delete.operation';
import * as get from './get.operation';

export { create, del as delete, get };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['reactions'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new reaction',
				action: 'Create a reaction',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a reaction',
				action: 'Delete a reaction',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a reaction by ID',
				action: 'Get a reaction',
			},
		],
		default: 'create',
	},
	...create.description,
	...del.description,
	...get.description,
];
