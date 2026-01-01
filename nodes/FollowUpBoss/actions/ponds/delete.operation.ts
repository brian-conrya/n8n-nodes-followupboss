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
	getPondIdProperty,
	getUserIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['ponds'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPondIdProperty(true),
		description: 'ID of the pond to delete. Choose from the list, or specify an ID.',
	},
	{
		...getUserIdProperty('Assign To Agent', 'assignTo', true),
		description:
			'Select which agent should receive any contacts currently in this pond after it is deleted. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const pondIdRaw = (this.getNodeParameter('pondId', i) as IDataObject).value as string;
	const pondId = toInt(pondIdRaw, 'Pond ID', this.getNode(), i);
	const assignToRaw = (this.getNodeParameter('assignTo', i) as IDataObject).value as string;
	const assignTo = toInt(assignToRaw, 'Assign To User ID', this.getNode(), i);
	const qs: IDataObject = { assignTo };
	await apiRequest.call(this, 'DELETE', `/ponds/${pondId}`, {}, qs);
	return wrapDeleteSuccess();
}
