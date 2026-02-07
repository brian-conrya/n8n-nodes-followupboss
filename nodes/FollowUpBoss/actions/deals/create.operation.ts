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
	getPipelineStageIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['deals'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Deal for 123 Main St',
		description: 'Name of the deal',
	},
	{
		...getPipelineStageIdProperty(),
		name: 'stageId',
		description:
			'The pipeline stage that this deal should be assigned to. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Agent Commission',
				name: 'agentCommission',
				type: 'string',
				default: '',
				placeholder: 'e.g. 50',
				description: 'Commission split % for the agent',
			},
			{
				displayName: 'Commission Value',
				name: 'commissionValue',
				type: 'string',
				default: '',
				placeholder: 'e.g. 15000',
				description: 'Commission value to assign to this deal',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				placeholder: 'e.g. Needs financing approval',
				description: 'Description of the deal',
			},
			{
				displayName: 'Due Diligence Date',
				name: 'dueDiligenceDate',
				type: 'dateTime',
				default: '',
				description: 'Due Diligence Date for this deal',
			},
			{
				displayName: 'Earnest Money Due Date',
				name: 'earnestMoneyDueDate',
				type: 'dateTime',
				default: '',
				description: 'Earnest Money Due Date for this deal',
			},
			{
				displayName: 'Final Walk Through Date',
				name: 'finalWalkThroughDate',
				type: 'dateTime',
				default: '',
				description: 'Final Walk Through Date for this deal',
			},
			{
				displayName: 'Mutual Acceptance Date',
				name: 'mutualAcceptanceDate',
				type: 'dateTime',
				default: '',
				description: 'Mutual Acceptance Date for this deal',
			},
			{
				displayName: 'Order Weight',
				name: 'orderWeight',
				type: 'string',
				default: '',
				placeholder: 'e.g. 10',
				description: 'Set this value to enforce a specific sort order',
			},
			{
				displayName: 'People IDs',
				name: 'peopleIds',
				type: 'string',
				default: '',
				description: 'A comma-separated list of person IDs that should be part of this deal',
				placeholder: 'e.g. 123,456',
			},
			{
				displayName: 'Possession Date',
				name: 'possessionDate',
				type: 'dateTime',
				default: '',
				description: 'Possession Date for this deal',
			},
			{
				displayName: 'Price',
				name: 'price',
				type: 'string',
				default: '',
				placeholder: 'e.g. 500000',
				description: 'The price associated with this deal',
			},
			{
				displayName: 'Projected Close Date',
				name: 'projectedCloseDate',
				type: 'dateTime',
				default: '',
				description: 'Projected close date of this deal',
			},
			{
				displayName: 'Team Commission',
				name: 'teamCommission',
				type: 'string',
				default: '',
				placeholder: 'e.g. 50',
				description: 'Commission split % for the team',
			},
			{
				displayName: 'User Names or IDs',
				name: 'userIds',
				type: 'multiOptions',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
				},
				default: [],
				description:
					'A list of user IDs that should be part of this deal. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', i) as string;
	const stageIdRaw = (this.getNodeParameter('stageId', i) as IDataObject).value as string;
	const stageId = toInt(stageIdRaw, 'Stage ID', this.getNode(), i);

	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
	const body: IDataObject = {
		name,
		stageId,
		...additionalFields,
	};

	if (body.agentCommission) {
		body.agentCommission = toInt(
			body.agentCommission as string,
			'Agent Commission',
			this.getNode(),
			i,
		);
	}
	if (body.commissionValue) {
		body.commissionValue = toInt(
			body.commissionValue as string,
			'Commission Value',
			this.getNode(),
			i,
		);
	}
	if (body.orderWeight) {
		body.orderWeight = toInt(body.orderWeight as string, 'Order Weight', this.getNode(), i);
	}
	if (body.peopleIds) {
		const peopleIdsRaw = body.peopleIds as string;
		body.peopleIds = peopleIdsRaw
			.split(',')
			.map((id) => toInt(id.trim(), 'People ID', this.getNode(), i));
	}
	if (body.price) {
		body.price = toInt(body.price as string, 'Price', this.getNode(), i);
	}
	if (body.teamCommission) {
		body.teamCommission = toInt(
			body.teamCommission as string,
			'Team Commission',
			this.getNode(),
			i,
		);
	}
	if (body.userIds) {
		const userIds = body.userIds as string[];
		body.userIds = userIds.map((id) => toInt(id as string, 'User ID', this.getNode(), i));
	}

	const response = await apiRequest.call(this, 'POST', '/deals', body);
	return wrapData(response, i);
}
