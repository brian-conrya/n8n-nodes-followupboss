import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import { updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['groups'],
		operation: ['roundRobin'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: [
			{
				name: 'Agent',
				value: 'Agent',
			},
			{
				name: 'Lender',
				value: 'Lender',
			},
		],
		default: 'Agent',
		description: 'Agent groups allow admins and agents and Lender groups allow lender role users',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const type = this.getNodeParameter('type', i) as string;
	const qs: IDataObject = {};
	if (type) qs.type = type;

	const groups = await apiRequestAllItems.call(this, '/groups/roundRobin', qs);
	return wrapData(groups);
}
