import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapDeleteSuccess } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['ponds'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Pond Name or ID',
		name: 'pondId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPonds',
		},
		default: '',
		required: true,
		description:
			'ID of the pond to delete. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Assign To Agent Name or ID',
		name: 'assignTo',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		default: '',
		required: true,
		description:
			'Select which agent should receive any contacts currently in this pond after it is deleted. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const pondId = toInt(this.getNodeParameter('pondId', i) as string, 'Pond ID', this.getNode(), i);
	const assignTo = toInt(this.getNodeParameter('assignTo', i) as string, 'Assign To', this.getNode(), i);
	const qs: IDataObject = { assignTo };
	await apiRequest.call(this, 'DELETE', `/ponds/${pondId}`, {}, qs);
	return wrapDeleteSuccess();
}
