import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import { wrapData } from '../../helpers/utils';

const resource = 'timeframes';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const response = await apiRequestAllItems.call(this, `/${resource}`);
	return wrapData(response, i);
}
