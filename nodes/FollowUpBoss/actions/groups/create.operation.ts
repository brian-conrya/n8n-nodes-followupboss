import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { updateDisplayOptions, wrapData, toInt } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['groups'],
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
		placeholder: 'e.g. Sales Team',
		description: 'Name of the group',
	},
	{
		displayName: 'Users',
		name: 'users',
		type: 'collection',
		typeOptions: {
			multipleValues: true,
			multipleValueButtonText: 'Add User',
		},
		default: [],
		required: true,
		description: 'An array of user IDs that will be members of this group',
		options: [
			{
				displayName: 'User Name or ID',
				name: 'userId',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
				},
				default: '',
				description:
					'The ID of the user. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
			},
		],
	},
	{
		displayName: 'Distribution',
		name: 'distribution',
		type: 'options',
		options: [
			{
				name: 'Round Robin',
				value: 'round-robin',
			},
			{
				name: 'First to Claim',
				value: 'first-to-claim',
			},
		],
		default: 'round-robin',
		description: 'The distribution model to utilize',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		options: [
			{
				name: 'Agent',
				value: 'Agent',
			},
			{
				name: 'Lender',
				value: 'Lender',
			},
		],
		default: 'Agent',
		description: 'Agent groups allow admins and agents and Lender groups allow lender role users',
	},
	{
		displayName: 'Claim Window',
		name: 'claimWindow',
		type: 'string',
		default: '1800',
		displayOptions: {
			show: {
				distribution: ['first-to-claim'],
			},
		},
		description:
			'Number of seconds to allow someone to claim a lead in a first-to-claim group before reassigning',
	},
	{
		displayName: 'Default Group Name or ID',
		name: 'defaultGroupId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getGroups',
		},
		default: '',
		displayOptions: {
			show: {
				distribution: ['first-to-claim'],
			},
		},
		description:
			'The ID of the group to assign unclaimed first-to-claim leads to after the claim window expires. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Default Pond Name or ID',
		name: 'defaultPondId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPonds',
		},
		default: '',
		displayOptions: {
			show: {
				distribution: ['first-to-claim'],
			},
		},
		description:
			'The ID of the pond to assign unclaimed first-to-claim leads to after the claim window expires. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Default User Name or ID',
		name: 'defaultUserId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		default: '',
		displayOptions: {
			show: {
				distribution: ['first-to-claim'],
			},
		},
		description:
			'The ID of the user to assign unclaimed first-to-claim leads to after the claim window expires. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', i) as string;
	const usersCollection = this.getNodeParameter('users', i) as IDataObject[];
	const users = usersCollection.map((u) => toInt(u.userId as string, 'User ID', this.getNode(), i));
	const distribution = this.getNodeParameter('distribution', i) as string;
	const type = this.getNodeParameter('type', i) as string;

	const body: IDataObject = {
		name,
		users,
		distribution,
		type,
	};

	if (distribution === 'first-to-claim') {
		const claimWindowRaw = this.getNodeParameter('claimWindow', i) as string;
		const claimWindow = toInt(claimWindowRaw, 'Claim Window', this.getNode(), i);
		const defaultGroupId = toInt(
			this.getNodeParameter('defaultGroupId', i) as string,
			'Default Group ID',
			this.getNode(),
			i,
		);
		const defaultPondId = toInt(
			this.getNodeParameter('defaultPondId', i) as string,
			'Default Pond ID',
			this.getNode(),
			i,
		);
		const defaultUserId = toInt(
			this.getNodeParameter('defaultUserId', i) as string,
			'Default User ID',
			this.getNode(),
			i,
		);

		if (claimWindow) body.claimWindow = claimWindow;
		if (defaultGroupId) body.defaultGroupId = defaultGroupId;
		if (defaultPondId) body.defaultPondId = defaultPondId;
		if (defaultUserId) body.defaultUserId = defaultUserId;
	}
	const response = await apiRequest.call(this, 'POST', '/groups', body);
	return wrapData(response);
}
