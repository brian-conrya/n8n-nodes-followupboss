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
	wrapData,
	getAppointmentTypeIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['appointmentTypes'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getAppointmentTypeIdProperty(),
		name: 'id',
		description: 'ID of the appointment type to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Appointment Type ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/appointmentTypes/${id}`);
	return wrapData(response, i);
}
