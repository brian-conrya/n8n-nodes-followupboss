import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { wrapData } from '../../helpers/utils';

export const description: INodeProperties[] = [];

export async function execute(
	this: IExecuteFunctions,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	i: number,
): Promise<INodeExecutionData[]> {
	const response = await apiRequest.call(this, 'GET', '/me');
	return wrapData(response);
}
