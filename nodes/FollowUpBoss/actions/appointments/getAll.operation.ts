import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
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
		displayName: 'User Name or ID',
		name: 'userId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		default: '',
		description: 'Filter by user ID. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Created By Name or ID',
		name: 'createdById',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		default: '',
		description: 'Filter by creator ID. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Type Name or ID',
		name: 'typeId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAppointmentTypes',
		},
		default: '',
		description: 'Filter by appointment type ID. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Outcome Name or ID',
		name: 'outcomeId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAppointmentOutcomes',
		},
		default: '',
		description: 'Filter by appointment outcome ID. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions,
});

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	if (options.includeDeleted) {
		qs.includeDeleted = true;
	}
	if (options.userId) {
		qs.userId = options.userId;
	}
	if (options.createdById) {
		qs.createdById = options.createdById;
	}
	if (options.typeId) {
		qs.typeId = options.typeId;
	}
	if (options.outcomeId) {
		qs.outcomeId = options.outcomeId;
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const appointments = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);

	return wrapData(appointments);
}
