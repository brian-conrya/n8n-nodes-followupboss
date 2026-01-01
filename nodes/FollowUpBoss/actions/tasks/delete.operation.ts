import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	toInt,
	updateDisplayOptions,
	wrapDeleteSuccess,
	getTaskIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['tasks'],
		operation: ['delete'],
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
	index: number,
): Promise<INodeExecutionData[]> {
	const taskIdRaw = (this.getNodeParameter('taskId', index) as IDataObject).value as string;
	const taskId = toInt(taskIdRaw, 'Task ID', this.getNode(), index);
	await apiRequest.call(this, 'DELETE', `/tasks/${taskId}`);
	return wrapDeleteSuccess();
}
