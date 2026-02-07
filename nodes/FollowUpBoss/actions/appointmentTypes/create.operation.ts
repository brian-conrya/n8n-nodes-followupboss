import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';

import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['appointmentTypes'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		description: 'Name of the appointment type',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Order Weight',
				name: 'orderWeight',
				type: 'string',
				default: '',
				description: 'Set this value to enforce a specific sort order',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {
		name,
	};

	if (additionalFields.orderWeight) {
		body.orderWeight = toInt(
			additionalFields.orderWeight as string,
			'Order Weight',
			this.getNode(),
			i,
		);
	}

	const response = await apiRequest.call(this, 'POST', '/appointmentTypes', body);
	return wrapData(response, i);
}
