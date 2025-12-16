import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
    addCommonParameters,
    createGetAllOperationDescription,
    wrapData,
    toInt,
} from '../../helpers/utils';

const resource = 'actionPlansPeople';

export const description: INodeProperties[] = createGetAllOperationDescription({
    resource,
    resourceSpecificOptions: [
        {
            displayName: 'Action Plan Name or ID',
            name: 'actionPlanId',
            type: 'options',
            typeOptions: {
                loadOptionsMethod: 'getActionPlans',
            },
            default: '',
            description: 'ID of the action plan. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        },
        {
            displayName: 'Person ID',
            name: 'personId',
            type: 'string',
            default: '',
            description: 'ID of the person',
        },
    ],
});

export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const options = this.getNodeParameter('options', i, {}) as IDataObject;
    const qs: IDataObject = {};

    if (options.personId) {
        qs.personId = toInt(options.personId as string, 'Person ID', this.getNode(), i);
    }
    if (options.actionPlanId) {
        qs.actionPlanId = toInt(options.actionPlanId as string, 'Action Plan ID', this.getNode(), i);
    }

    const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
    addCommonParameters(options, qs, sort);

    const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
    const response = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);
    return wrapData(response);
}
