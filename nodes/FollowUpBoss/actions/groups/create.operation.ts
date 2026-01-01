import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	updateDisplayOptions,
	wrapData,
	toInt,
	getUserIdProperty,
	getGroupIdProperty,
	getPondIdProperty,
} from '../../helpers/utils';

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
		displayName: 'User Names or IDs',
		name: 'users',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		default: [],
		required: true,
		description:
			'A list of user IDs that will be members of this group. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
		...getGroupIdProperty(false, 'defaultGroupId'),
		displayName: 'Default Group',
		displayOptions: {
			show: {
				distribution: ['first-to-claim'],
			},
		},
		description:
			'The ID of the group to assign unclaimed first-to-claim leads to after the claim window expires. Choose from the list, or specify an ID.',
	},
	{
		...getPondIdProperty(false),
		displayName: 'Default Pond',
		name: 'defaultPondId',
		displayOptions: {
			show: {
				distribution: ['first-to-claim'],
			},
		},
		description:
			'The ID of the pond to assign unclaimed first-to-claim leads to after the claim window expires. Choose from the list, or specify an ID.',
	},
	{
		...getUserIdProperty('Default User', 'defaultUserId', false),
		displayOptions: {
			show: {
				distribution: ['first-to-claim'],
			},
		},
		description:
			'The ID of the user to assign unclaimed first-to-claim leads to after the claim window expires. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', i) as string;
	const users = this.getNodeParameter('users', i) as string[];
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
		const defaultGroupIdRaw = (
			this.getNodeParameter('defaultGroupId', i, { value: '' }) as IDataObject
		).value as string;
		const defaultPondIdRaw = (
			this.getNodeParameter('defaultPondId', i, { value: '' }) as IDataObject
		).value as string;
		const defaultUserIdRaw = (
			this.getNodeParameter('defaultUserId', i, { value: '' }) as IDataObject
		).value as string;

		if (claimWindow) body.claimWindow = claimWindow;
		if (defaultGroupIdRaw) {
			body.defaultGroupId = toInt(defaultGroupIdRaw, 'Default Group ID', this.getNode(), i);
		}
		if (defaultPondIdRaw) {
			body.defaultPondId = toInt(defaultPondIdRaw, 'Default Pond ID', this.getNode(), i);
		}
		if (defaultUserIdRaw) {
			body.defaultUserId = toInt(defaultUserIdRaw, 'Default User ID', this.getNode(), i);
		}
	}
	const response = await apiRequest.call(this, 'POST', '/groups', body);
	return wrapData(response);
}
