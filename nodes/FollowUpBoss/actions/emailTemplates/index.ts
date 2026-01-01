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
				resource: ['emailTemplates'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new email template',
				action: 'Create an email template',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete an email template',
				action: 'Delete an email template',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve an email template by ID',
				action: 'Get an email template',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of email templates',
				action: 'Get many email templates',
			},
			{
				name: 'Merge',
				value: 'merge',
				description: 'Merge an email template with a person',
				action: 'Merge an email template',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update an email template's details",
				action: 'Update an email template',
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
