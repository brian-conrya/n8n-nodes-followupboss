import { INodeProperties } from 'n8n-workflow';

import * as del from './delete.operation';
import * as get from './get.operation';
import * as getAll from './getAll.operation';
import * as me from './me.operation';

export { del as delete, get, getAll, me };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a user',
				action: 'Delete a user',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a user',
				action: 'Get a user',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of users',
				action: 'Get many users',
			},
			{
				name: 'Me',
				value: 'me',
				description: 'Retrieve the current user',
				action: 'Get current user',
			},
		],
		default: 'getAll',
		displayOptions: {
			show: {
				resource: ['users'],
			},
		},
	},
	...del.description,
	...get.description,
	...getAll.description,
	...me.description,
];
