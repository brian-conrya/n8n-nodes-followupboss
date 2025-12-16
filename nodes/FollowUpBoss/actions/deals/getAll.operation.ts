import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
    addCommonParameters,
    createGetAllOperationDescription,
    toInt,
    wrapData,
} from '../../helpers/utils';

const resourceSpecificOptions: INodeProperties[] = [
    {
        displayName: 'Include Archived',
        name: 'includeArchived',
        type: 'boolean',
        default: false,
        description: 'Whether to include deals with a status of Archived in the results',
    },
    {
        displayName: 'Include Deleted',
        name: 'includeDeleted',
        type: 'boolean',
        default: false,
        description: 'Whether to include deals with a status of Deleted in the results',
    },
    {
        displayName: 'Person ID',
        name: 'personId',
        type: 'string',
        default: '',
        description: 'Return a list of deals for a specific person',
    },
    {
        displayName: 'Pipeline Name or ID',
        name: 'pipelineId',
        type: 'options',
        typeOptions: {
            loadOptionsMethod: 'getPipelines',
        },
        default: '',
        description: 'Return deals for a specific pipeline only. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    },
    {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
            { name: 'Active', value: 'Active' },
            { name: 'Archived', value: 'Archived' },
            { name: 'Deleted', value: 'Deleted' },
        ],
        default: 'Active',
        description: 'Only return deals with this status',
    },
    {
        displayName: 'User Name or ID',
        name: 'userId',
        type: 'options',
        typeOptions: {
            loadOptionsMethod: 'getUsers',
        },
        default: '',
        description: 'Return a list of deals for a specific user. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    },
];

export const description: INodeProperties[] = createGetAllOperationDescription({
    resource: 'deals',
    resourceSpecificOptions,
});

export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;
    const options = this.getNodeParameter('options', i, {}) as IDataObject;
    const qs: IDataObject = {};

    const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
    addCommonParameters(options, qs, sort);

    if (options.includeArchived) {
        qs.includeArchived = 1;
    }
    if (options.includeDeleted) {
        qs.includeDeleted = 1;
    }
    if (options.personId) {
        qs.personId = toInt(options.personId as string, 'Person ID', this.getNode(), i);
    }
    if (options.pipelineId) {
        qs.pipelineId = toInt(options.pipelineId as string, 'Pipeline ID', this.getNode(), i);
    }
    if (options.status) {
        qs.status = options.status;
    }
    if (options.userId) {
        qs.userId = toInt(options.userId as string, 'User ID', this.getNode(), i);
    }

    const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
    const deals = await apiRequestAllItems.call(this, '/deals', qs, limit);

    return wrapData(deals);
}

