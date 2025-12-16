import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import { addCommonParameters, wrapData } from '../../helpers/utils';

const resource = 'timeframes';

export const description: INodeProperties[] = [];

export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {
    const qs: IDataObject = {};
    const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
    addCommonParameters({}, qs, sort);
    const response = await apiRequestAllItems.call(this, `/${resource}`, qs);
    return wrapData(response);
}
