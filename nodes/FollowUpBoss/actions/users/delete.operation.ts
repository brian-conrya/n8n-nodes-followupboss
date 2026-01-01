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
	getUserIdProperty,
} from '../../helpers/utils';

const properties: INodeProperties[] = [
	{
		...getUserIdProperty('User', 'id', true),
		description: 'The user to delete. Choose from the list, or specify an ID.',
	},
	{
		...getUserIdProperty('Assign To', 'assignTo', true),
		description:
			"Another user to reassign the deleted user's leads to. Choose from the list, or specify an ID.",
	},
];

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['users'],
		operation: ['delete'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'User ID', this.getNode(), i);
	const assignToRaw = (this.getNodeParameter('assignTo', i) as IDataObject).value as string;
	const assignTo = toInt(assignToRaw, 'Assign To User ID', this.getNode(), i);
	const qs = { assignTo: assignTo };
	await apiRequest.call(this, 'DELETE', `/users/${id}`, {}, qs);
	return wrapDeleteSuccess();
}
