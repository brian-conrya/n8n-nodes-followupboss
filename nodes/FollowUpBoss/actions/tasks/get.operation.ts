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
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getTaskIdProperty(),
		name: 'taskId',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const taskIdRaw = (this.getNodeParameter('taskId', i) as IDataObject).value as string;
	const taskId = toInt(taskIdRaw, 'Task ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/tasks/${taskId}`);
	return wrapData(response, i);
}
