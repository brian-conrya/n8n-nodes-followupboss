import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getTaskIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['tasks'],
		operation: ['complete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getTaskIdProperty(),
		name: 'taskId',
	},
	{
		displayName: 'Is Completed',
		name: 'isCompleted',
		type: 'boolean',
		default: true,
		description: 'Whether the task is completed',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const taskIdRaw = (this.getNodeParameter('taskId', i) as IDataObject).value as string;
	const taskId = toInt(taskIdRaw, 'Task ID', this.getNode(), i);
	const isCompleted = this.getNodeParameter('isCompleted', i) as boolean;

	const body = {
		isCompleted,
	};

	const response = await apiRequest.call(this, 'PUT', `/tasks/${taskId}`, body);
	return wrapData(response, i);
}
