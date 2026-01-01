import { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as del from './delete.operation';
import * as get from './get.operation';
import * as getAll from './getAll.operation';
import * as merge from './merge.operation';
import * as update from './update.operation';

export { create, del as delete, get, getAll, merge, update };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['textMessageTemplates'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new text message template',
				action: 'Create a text message template',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a text message template',
				action: 'Delete a text message template',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a text message template by ID',
				action: 'Get a text message template',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of text message templates',
				action: 'Get many text message templates',
			},
			{
				name: 'Merge',
				value: 'merge',
				description: 'Merge a text message template with a person',
				action: 'Merge a text message template',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update a text message template's details",
				action: 'Update a text message template',
			},
		],
		default: 'create',
	},
	...update.description,
	...create.description,
	...getAll.description,
	...merge.description,
	...del.description,
	...get.description,
];
