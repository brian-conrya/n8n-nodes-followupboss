import { INodeProperties } from 'n8n-workflow';

import * as get from './get.operation';
import * as getAll from './getAll.operation';

export { get, getAll };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['smartLists'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a smart list by ID',
				action: 'Get a smart list',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of smart lists',
				action: 'Get many smart lists',
			},
		],
		default: 'getAll',
	},
	...getAll.description,
	...get.description,
];
