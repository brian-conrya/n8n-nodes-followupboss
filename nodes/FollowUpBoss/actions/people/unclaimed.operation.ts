import { IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import { wrapData } from '../../helpers/utils';

export const description: INodeProperties[] = [];

export async function unclaimed(
    this: IExecuteFunctions,
): Promise<INodeExecutionData[]> {
    const response = await apiRequestAllItems.call(this, '/people/unclaimed');
    return wrapData(response);
}
