import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

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
		displayName: 'Stage Name or ID',
		name: 'stageId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPipelineStages',
		},
		default: '',
		required: true,
		description: 'The pipeline stage that this deal should be assigned to. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
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
		typeOptions: {
			multipleValues: true,
		},
		default: [],
		description: 'A list of person IDs that should be part of this deal',
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
		description: 'A list of user IDs that should be part of this deal. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', index) as string;
	const stageIdRaw = this.getNodeParameter('stageId', index) as string;
	const stageId = toInt(stageIdRaw, 'Stage ID', this.getNode(), index);

	const agentCommissionRaw = this.getNodeParameter('agentCommission', index) as string;
	const commissionValueRaw = this.getNodeParameter('commissionValue', index) as string;
	const description = this.getNodeParameter('description', index) as string;
	const dueDiligenceDate = this.getNodeParameter('dueDiligenceDate', index) as string;
	const earnestMoneyDueDate = this.getNodeParameter('earnestMoneyDueDate', index) as string;
	const finalWalkThroughDate = this.getNodeParameter('finalWalkThroughDate', index) as string;
	const mutualAcceptanceDate = this.getNodeParameter('mutualAcceptanceDate', index) as string;
	const orderWeightRaw = this.getNodeParameter('orderWeight', index) as string;
	const peopleIds = this.getNodeParameter('peopleIds', index) as string[];
	const possessionDate = this.getNodeParameter('possessionDate', index) as string;
	const priceRaw = this.getNodeParameter('price', index) as string;
	const projectedCloseDate = this.getNodeParameter('projectedCloseDate', index) as string;
	const teamCommissionRaw = this.getNodeParameter('teamCommission', index) as string;
	const userIds = this.getNodeParameter('userIds', index) as string[];

	const body: IDataObject = {
		name,
		stageId,
	};

	if (agentCommissionRaw) {
		body.agentCommission = toInt(agentCommissionRaw, 'Agent Commission', this.getNode(), index);
	}
	if (commissionValueRaw) {
		body.commissionValue = toInt(commissionValueRaw, 'Commission Value', this.getNode(), index);
	}
	if (description) {
		body.description = description;
	}
	if (dueDiligenceDate) {
		body.dueDiligenceDate = dueDiligenceDate;
	}
	if (earnestMoneyDueDate) {
		body.earnestMoneyDueDate = earnestMoneyDueDate;
	}
	if (finalWalkThroughDate) {
		body.finalWalkThroughDate = finalWalkThroughDate;
	}
	if (mutualAcceptanceDate) {
		body.mutualAcceptanceDate = mutualAcceptanceDate;
	}
	if (orderWeightRaw) {
		body.orderWeight = toInt(orderWeightRaw, 'Order Weight', this.getNode(), index);
	}
	if (peopleIds && peopleIds.length > 0) {
		body.peopleIds = peopleIds.map(id => toInt(id, 'People ID', this.getNode(), index));
	}
	if (possessionDate) {
		body.possessionDate = possessionDate;
	}
	if (priceRaw) {
		body.price = toInt(priceRaw, 'Price', this.getNode(), index);
	}
	if (projectedCloseDate) {
		body.projectedCloseDate = projectedCloseDate;
	}
	if (teamCommissionRaw) {
		body.teamCommission = toInt(teamCommissionRaw, 'Team Commission', this.getNode(), index);
	}
	if (userIds && userIds.length > 0) {
		body.userIds = userIds.map(id => toInt(id as string, 'User ID', this.getNode(), index));
	}

	const response = await apiRequest.call(this, 'POST', '/deals', body);
	return wrapData(response);
}

