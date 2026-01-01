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
				resource: ['identity'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve the current identity',
				action: 'Get identity',
			},
		],
		default: 'get',
	},
	...get.description,
];
