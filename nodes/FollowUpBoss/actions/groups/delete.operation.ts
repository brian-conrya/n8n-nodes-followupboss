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
	getGroupIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['groups'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getGroupIdProperty(true, 'id'),
		description: 'ID of the group to delete. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Group ID', this.getNode(), i);
	await apiRequest.call(this, 'DELETE', `/groups/${id}`);
	return wrapDeleteSuccess();
}
