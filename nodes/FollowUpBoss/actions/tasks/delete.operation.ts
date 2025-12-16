import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapDeleteSuccess } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['tasks'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the task to delete',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const taskIdRaw = this.getNodeParameter('taskId', index) as string;
	const taskId = toInt(taskIdRaw, 'Task ID', this.getNode(), index);
	await apiRequest.call(this, 'DELETE', `/tasks/${taskId}`);
	return wrapDeleteSuccess();
}
