import { INodeProperties } from 'n8n-workflow';

import * as get from './get.operation';
import * as getAll from './getAll.operation';
import * as log from './log.operation';

export { get, getAll, log };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['textMessages'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a text message',
				action: 'Get a text message',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of text messages',
				action: 'Get many text messages',
			},
			{
				name: 'Log',
				value: 'log',
				description: 'Log a text message',
				action: 'Log a text message',
			},
		],
		default: 'log',
	},
	...getAll.description,
	...get.description,
	...log.description,
];
