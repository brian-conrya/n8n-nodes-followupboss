import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
    addCommonParameters,
    createGetAllOperationDescription,
    wrapData,
    toInt,
} from '../../helpers/utils';

const resource = 'automationsPeople';

export const description: INodeProperties[] = createGetAllOperationDescription({
    resource,
    resourceSpecificOptions: [
        {
            displayName: 'Person ID',
            name: 'personId',
            type: 'string',
            default: '',
            description: 'ID of a Person (i.e. to view only pairings for that Person).',
        },
        {
            displayName: 'Automation Name or ID',
            name: 'automationId',
            type: 'options',
            typeOptions: {
                loadOptionsMethod: 'getAutomations',
            },
            default: '',
            description: 'ID of an Automation (i.e. to view only pairings for that Automation). Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        },
        {
            displayName: 'Status',
            name: 'status',
            type: 'options',
            options: [
                {
                    name: 'Completed',
                    value: 'Completed',
                },
                {
                    name: 'Initial',
                    value: 'Initial',
                },
                {
                    name: 'Paused',
                    value: 'Paused',
                },
                {
                    name: 'Running',
                    value: 'Running',
                },
            ],
            default: 'Running',
            description: 'Automation Status to filter by',
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
    if (options.automationId) {
        qs.automationId = toInt(options.automationId as string, 'Automation ID', this.getNode(), i);
    }

    const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
    addCommonParameters(options, qs, sort);

    const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
    const automationsPeople = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);

    return wrapData(automationsPeople);
}
