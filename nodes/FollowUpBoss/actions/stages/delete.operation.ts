import {
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
	getStageIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['stages'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getStageIdProperty(true, 'id', true),
		description: 'ID of the stage to delete. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Stage ID', this.getNode(), i);
	await apiRequest.call(this, 'DELETE', `/stages/${id}`);
	return wrapDeleteSuccess();
}
