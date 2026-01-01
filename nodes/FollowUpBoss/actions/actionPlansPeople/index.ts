import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as getAll from './getAll.operation';
import * as update from './update.operation';

export { create, getAll, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['actionPlansPeople'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Add a person to an action plan',
				action: 'Create an action plans people',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of people on action plans',
				action: 'Get many action plans people',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a person on an action plan',
				action: 'Update an action plans people',
			},
		],
		default: 'create',
	},
	...create.description,
	...getAll.description,
	...update.description,
];
