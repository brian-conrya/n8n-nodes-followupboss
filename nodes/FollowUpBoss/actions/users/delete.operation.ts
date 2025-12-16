import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapDeleteSuccess } from '../../helpers/utils';

const properties: INodeProperties[] = [
    {
        displayName: 'User Name or ID',
        name: 'id',
        type: 'options',
        default: '',
        required: true,
        typeOptions: {
            loadOptionsMethod: 'getUsers',
        },
        description: 'The user to delete. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    },
    {
        displayName: 'Assign To Name or ID',
        name: 'assignTo',
        type: 'options',
        default: '',
        required: true,
        typeOptions: {
            loadOptionsMethod: 'getUsers',
        },
        description: 'Another user to reassign the deleted user\'s leads to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
    },
];

const displayOptions: IDisplayOptions = {
    show: {
        resource: ['users'],
        operation: ['delete'],
    },
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
    this: IExecuteFunctions,
    i: number,
): Promise<INodeExecutionData[]> {
    const id = toInt(this.getNodeParameter('id', i) as string, 'ID', this.getNode(), i); const assignTo = toInt(this.getNodeParameter('assignTo', i) as string, 'Assign To', this.getNode(), i);
    const qs = { assignTo: assignTo };
    await apiRequest.call(this, 'DELETE', `/users/${id}`, {}, qs);
    return wrapDeleteSuccess();
}
