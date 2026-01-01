import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as getAll from './getAll.operation';

export { create, getAll };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['emailMarketingEvents'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new email marketing event',
				action: 'Create an email marketing event',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of email marketing events',
				action: 'Get many email marketing events',
			},
		],
		default: 'create',
	},
	...create.description,
	...getAll.description,
];
