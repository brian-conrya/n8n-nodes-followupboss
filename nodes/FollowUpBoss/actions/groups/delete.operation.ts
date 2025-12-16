import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapDeleteSuccess } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['groups'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Group Name or ID',
		name: 'id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getGroups',
		},
		default: '',
		required: true,
		description:
			'ID of the group to delete. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const id = toInt(this.getNodeParameter('id', i) as string, 'ID', this.getNode(), i);
	await apiRequest.call(this, 'DELETE', `/groups/${id}`);
	return wrapDeleteSuccess();
}
