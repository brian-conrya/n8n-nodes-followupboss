import { INodeProperties } from 'n8n-workflow';

import * as get from './get.operation';
import * as getAll from './getAll.operation';
import * as log from './log.operation';
import * as update from './update.operation';

export { get, getAll, log, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['calls'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a call',
				action: 'Get a call',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of calls',
				action: 'Get many calls',
			},
			{
				name: 'Log Call',
				value: 'log',
				description: 'Log a call',
				action: 'Log a call',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update a call's details",
				action: 'Update a call',
			},
		],
		default: 'log',
	},
	...get.description,
	...getAll.description,
	...log.description,
	...update.description,
];
