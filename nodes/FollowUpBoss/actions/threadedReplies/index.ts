import { INodeProperties } from 'n8n-workflow';

import * as get from './get.operation';

export { get };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['threadedReplies'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a threaded reply',
				action: 'Get a threaded reply',
			},
		],
		default: 'get',
	},
	...get.description,
];
