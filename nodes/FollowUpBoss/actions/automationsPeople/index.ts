import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as get from './get.operation';
import * as getAll from './getAll.operation';
import * as update from './update.operation';

export { create, get, getAll, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['automationsPeople'],
			},
		},
		options: [
			{
				name: 'Assign',
				value: 'create',
				description: 'Assign an automation to a person',
				action: 'Assign an automation to a person',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an automation assignment',
				action: 'Get an automation assignment',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of automation assignments',
				action: 'Get many automation assignments',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an automation assignment',
				action: 'Update an automation assignment',
			},
		],
		default: 'create',
	},
	...create.description,
	...get.description,
	...getAll.description,
	...update.description,
];
