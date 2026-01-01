import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	toInt,
	updateDisplayOptions,
	wrapDeleteSuccess,
	getDealIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['deals'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getDealIdProperty(),
		description: 'The deal to delete. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const dealIdRaw = (this.getNodeParameter('dealId', index) as IDataObject).value as string;
	const dealId = toInt(dealIdRaw, 'Deal ID', this.getNode(), index);
	await apiRequest.call(this, 'DELETE', `/deals/${dealId}`);
	return wrapDeleteSuccess();
}
