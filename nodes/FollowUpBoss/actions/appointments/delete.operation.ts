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
	getAppointmentIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['appointments'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getAppointmentIdProperty(true),
		description: 'ID of the appointment to delete. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const appointmentIdRaw = (this.getNodeParameter('appointmentId', i) as IDataObject)
		.value as string;
	const appointmentId = toInt(appointmentIdRaw, 'Appointment ID', this.getNode(), i);
	await apiRequest.call(this, 'DELETE', `/appointments/${appointmentId}`);
	return wrapDeleteSuccess();
}
