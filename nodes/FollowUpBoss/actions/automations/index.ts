import { INodeProperties } from 'n8n-workflow';

import * as getAll from './getAll.operation';
import * as get from './get.operation';

export { getAll, get };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['automations'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an automation',
				action: 'Get an automation',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of automations',
				action: 'Get many automations',
			},
		],
		default: 'getAll',
	},
	...getAll.description,
	...get.description,
];
