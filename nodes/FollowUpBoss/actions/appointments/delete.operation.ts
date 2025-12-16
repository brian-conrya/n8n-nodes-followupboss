import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapDeleteSuccess } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['appointments'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Appointment ID',
		name: 'appointmentId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the appointment to delete',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const appointmentIdRaw = this.getNodeParameter('appointmentId', index) as string;
	const appointmentId = toInt(appointmentIdRaw, 'Appointment ID', this.getNode(), index);
	await apiRequest.call(this, 'DELETE', `/appointments/${appointmentId}`);
	return wrapDeleteSuccess();
}

