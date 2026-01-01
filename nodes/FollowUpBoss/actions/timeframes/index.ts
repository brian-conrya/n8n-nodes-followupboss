import { INodeProperties } from 'n8n-workflow';

import * as getAll from './getAll.operation';

export { getAll };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['timeframes'],
			},
		},
		options: [
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of timeframes',
				action: 'Get many timeframes',
			},
		],
		default: 'getAll',
	},
	...getAll.description,
];
