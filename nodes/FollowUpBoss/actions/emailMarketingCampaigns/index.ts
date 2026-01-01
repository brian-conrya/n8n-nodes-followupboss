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
				resource: ['emailMarketingCampaigns'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new email marketing campaign',
				action: 'Create an email marketing campaign',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of email marketing campaigns',
				action: 'Get many email marketing campaigns',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update an email marketing campaign's details",
				action: 'Update an email marketing campaign',
			},
		],
		default: 'create',
	},
	...create.description,
	...getAll.description,
	...update.description,
];
