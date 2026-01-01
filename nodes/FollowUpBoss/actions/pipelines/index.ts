import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as del from './delete.operation';
import * as get from './get.operation';
import * as getAll from './getAll.operation';
import * as update from './update.operation';

export { create, del as delete, get, getAll, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['pipelines'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new pipeline',
				action: 'Create a pipeline',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a pipeline',
				action: 'Delete a pipeline',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a pipeline by ID',
				action: 'Get a pipeline',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of pipelines',
				action: 'Get many pipelines',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update a pipeline's details",
				action: 'Update a pipeline',
			},
		],
		default: 'create',
	},
	...update.description,
	...create.description,
	...getAll.description,
	...del.description,
	...get.description,
];
