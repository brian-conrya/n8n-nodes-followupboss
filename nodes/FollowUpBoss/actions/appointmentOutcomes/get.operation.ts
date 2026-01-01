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
	getAppointmentOutcomeIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['appointmentOutcomes'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getAppointmentOutcomeIdProperty(true, 'id'),
		description:
			'ID of the appointment outcome to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Appointment Outcome ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/appointmentOutcomes/${id}`);
	return wrapData(response);
}
