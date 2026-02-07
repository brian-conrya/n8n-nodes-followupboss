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
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getAppointmentTypeIdProperty(),
		name: 'id',
		description: 'ID of the appointment type to update. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the appointment type',
			},
			{
				displayName: 'Order Weight',
				name: 'orderWeight',
				type: 'string',
				default: '',
				description: 'Set this value to enforce a specific sort order',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Appointment Type ID', this.getNode(), i);
	const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

	if (updateFields.orderWeight) {
		updateFields.orderWeight = toInt(
			updateFields.orderWeight as string,
			'Order Weight',
			this.getNode(),
			i,
		);
	}

	const response = await apiRequest.call(this, 'PUT', `/appointmentTypes/${id}`, updateFields);
	return wrapData(response, i);
}
