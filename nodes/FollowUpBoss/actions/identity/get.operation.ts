import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { wrapData } from '../../helpers/utils';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const response = await apiRequest.call(this, 'GET', '/identity');
	return wrapData(response, i);
}
