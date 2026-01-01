import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	getAppointmentOutcomeIdProperty,
	getAppointmentTypeIdProperty,
	getUserIdProperty,
	toInt,
	wrapData,
} from '../../helpers/utils';

const resource = 'appointments';

const resourceSpecificOptions: INodeProperties[] = [
	{
		displayName: 'Include Deleted',
		name: 'includeDeleted',
		type: 'boolean',
		default: false,
		description: 'Whether to include appointments that have been deleted',
	},
	{
		...getUserIdProperty('User', 'userId', false),
		description: 'Filter by user ID. Choose from the list, or specify an ID.',
	},
	{
		...getUserIdProperty('Created By', 'createdById', false),
		description: 'Filter by creator ID. Choose from the list, or specify an ID.',
	},
	{
		...getAppointmentTypeIdProperty(false),
		description: 'Filter by appointment type ID. Choose from the list, or specify an ID.',
	},
	{
		...getAppointmentOutcomeIdProperty(false),
		description: 'Filter by appointment outcome ID. Choose from the list, or specify an ID.',
	},
];

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions,
});

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	if (options.includeDeleted) {
		qs.includeDeleted = true;
	}
	if (options.userId) {
		const userIdRaw = (options.userId as IDataObject).value as string;
		qs.userId = toInt(userIdRaw, 'User ID', this.getNode(), i);
	}
	if (options.createdById) {
		const createdByIdRaw = (options.createdById as IDataObject).value as string;
		qs.createdById = toInt(createdByIdRaw, 'Created By ID', this.getNode(), i);
	}
	if (options.typeId) {
		const typeIdRaw = (options.typeId as IDataObject).value as string;
		qs.typeId = toInt(typeIdRaw, 'Type ID', this.getNode(), i);
	}
	if (options.outcomeId) {
		const outcomeIdRaw = (options.outcomeId as IDataObject).value as string;
		qs.outcomeId = toInt(outcomeIdRaw, 'Outcome ID', this.getNode(), i);
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const appointments = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);

	return wrapData(appointments);
}
