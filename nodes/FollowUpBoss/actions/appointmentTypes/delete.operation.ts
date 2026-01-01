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
	getAppointmentTypeIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['appointmentTypes'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getAppointmentTypeIdProperty(),
		name: 'id',
		description: 'ID of the appointment type to delete. Choose from the list, or specify an ID.',
	},
	{
		...getAppointmentTypeIdProperty(true, 'assignTypeId'),
		displayName: 'Reassign Appointments To',
		description:
			'The type ID to reassign existing appointments. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Appointment Type ID', this.getNode(), i);
	const assignTypeIdRaw = (this.getNodeParameter('assignTypeId', i) as IDataObject).value as string;
	const assignTypeId = toInt(assignTypeIdRaw, 'Assign Type ID', this.getNode(), i);

	await apiRequest.call(this, 'DELETE', `/appointmentTypes/${id}`, undefined, { assignTypeId });
	return wrapDeleteSuccess();
}
