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
	getAppointmentOutcomeIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['appointmentOutcomes'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getAppointmentOutcomeIdProperty(true, 'id'),
		description: 'ID of the appointment outcome to delete. Choose from the list, or specify an ID.',
	},
	{
		...getAppointmentOutcomeIdProperty(true, 'assignOutcomeId'),
		displayName: 'Reassign Outcomes To',
		description:
			'The outcome ID to reassign existing appointments. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Appointment Outcome ID', this.getNode(), i);
	const assignOutcomeIdRaw = (this.getNodeParameter('assignOutcomeId', i) as IDataObject)
		.value as string;
	const assignOutcomeId = toInt(assignOutcomeIdRaw, 'Assign Outcome ID', this.getNode(), i);

	await apiRequest.call(this, 'DELETE', `/appointmentOutcomes/${id}`, undefined, {
		assignOutcomeId,
	});
	return wrapDeleteSuccess();
}
