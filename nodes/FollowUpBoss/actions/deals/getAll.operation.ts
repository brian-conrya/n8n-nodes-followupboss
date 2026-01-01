import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	getPersonIdProperty,
	getPipelineIdProperty,
	getUserIdProperty,
	toInt,
	wrapData,
} from '../../helpers/utils';

const resourceSpecificOptions: INodeProperties[] = [
	{
		displayName: 'Include Archived',
		name: 'includeArchived',
		type: 'boolean',
		default: false,
		description: 'Whether to include deals with a status of Archived in the results',
	},
	{
		displayName: 'Include Deleted',
		name: 'includeDeleted',
		type: 'boolean',
		default: false,
		description: 'Whether to include deals with a status of Deleted in the results',
	},
	{
		...getPersonIdProperty(),
		name: 'personId',
		required: false,
		description:
			'Return a list of deals for a specific person. Choose from the list, or specify an ID.',
	},
	{
		...getPipelineIdProperty(false),
		description:
			'Return deals for a specific pipeline only. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'Active', value: 'Active' },
			{ name: 'Archived', value: 'Archived' },
			{ name: 'Deleted', value: 'Deleted' },
		],
		default: 'Active',
		description: 'Only return deals with this status',
	},
	{
		...getUserIdProperty('User', 'userId', false),
		description:
			'Return a list of deals for a specific user. Choose from the list, or specify an ID.',
	},
];

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource: 'deals',
	resourceSpecificOptions,
});

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	if (options.includeArchived) {
		qs.includeArchived = 1;
	}
	if (options.includeDeleted) {
		qs.includeDeleted = 1;
	}
	if (options.personId) {
		const personIdRaw = (options.personId as IDataObject).value as string;
		qs.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	}
	if (options.pipelineId) {
		const pipelineIdRaw = (options.pipelineId as IDataObject).value as string;
		qs.pipelineId = toInt(pipelineIdRaw, 'Pipeline ID', this.getNode(), i);
	}
	if (options.status) {
		qs.status = options.status;
	}
	if (options.userId) {
		const userIdRaw = (options.userId as IDataObject).value as string;
		qs.userId = toInt(userIdRaw, 'User ID', this.getNode(), i);
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const deals = await apiRequestAllItems.call(this, '/deals', qs, limit);

	return wrapData(deals);
}
