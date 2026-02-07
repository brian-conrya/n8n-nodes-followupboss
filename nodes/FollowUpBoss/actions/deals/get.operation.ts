import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getDealIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['deals'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getDealIdProperty(),
		description: 'The deal to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const dealIdRaw = (this.getNodeParameter('dealId', i) as IDataObject).value as string;
	const dealId = toInt(dealIdRaw, 'Deal ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/deals/${dealId}`);
	return wrapData(response, i);
}
