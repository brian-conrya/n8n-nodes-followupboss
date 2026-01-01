import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import type { IDataObject } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	updateDisplayOptions,
	wrapData,
	toInt,
	getGroupIdProperty,
	getUserIdProperty,
	getPondIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['groups'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getGroupIdProperty(),
		name: 'id',
		description: 'ID of the group to update. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
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
		...getGroupIdProperty(false),
		name: 'defaultGroupId',
		displayName: 'Default Group',
		description: 'The group to assign unclaimed leads to. Choose from the list, or specify an ID.',
		displayOptions: {
			show: {
				distribution: ['first-to-claim'],
			},
		},
	},
	{
		...getPondIdProperty(false),
		name: 'defaultPondId',
		displayName: 'Default Pond',
		description: 'The pond to assign unclaimed leads to. Choose from the list, or specify an ID.',
		displayOptions: {
			show: {
				distribution: ['first-to-claim'],
			},
		},
	},
	{
		...getUserIdProperty('Default User', 'defaultUserId', false),
		description: 'The user to assign unclaimed leads to. Choose from the list, or specify an ID.',
		displayOptions: {
			show: {
				distribution: ['first-to-claim'],
			},
		},
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Group ID', this.getNode(), i);
	const name = this.getNodeParameter('name', i) as string;
	const users = this.getNodeParameter('users', i) as string[];
	const distribution = this.getNodeParameter('distribution', i) as string;
	const type = this.getNodeParameter('type', i) as string;

	const body: IDataObject = {};
	if (name) body.name = name;
	if (users && users.length > 0) {
		body.users = users.map((u) => toInt(u, 'User ID', this.getNode(), i));
	}
	if (distribution) body.distribution = distribution;
	if (type) body.type = type;

	if (distribution === 'first-to-claim') {
		const claimWindowRaw = this.getNodeParameter('claimWindow', i) as string;
		const claimWindow = toInt(claimWindowRaw, 'Claim Window', this.getNode(), i);
		if (claimWindow) body.claimWindow = claimWindow;

		const defaultGroupIdRaw = (
			this.getNodeParameter('defaultGroupId', i, { value: '' }) as IDataObject
		).value as string;
		if (defaultGroupIdRaw) {
			body.defaultGroupId = toInt(defaultGroupIdRaw, 'Default Group ID', this.getNode(), i);
		}

		const defaultPondIdRaw = (
			this.getNodeParameter('defaultPondId', i, { value: '' }) as IDataObject
		).value as string;
		if (defaultPondIdRaw) {
			body.defaultPondId = toInt(defaultPondIdRaw, 'Default Pond ID', this.getNode(), i);
		}

		const defaultUserIdRaw = (
			this.getNodeParameter('defaultUserId', i, { value: '' }) as IDataObject
		).value as string;
		if (defaultUserIdRaw) {
			body.defaultUserId = toInt(defaultUserIdRaw, 'Default User ID', this.getNode(), i);
		}
	}
	const response = await apiRequest.call(this, 'PUT', `/groups/${id}`, body);
	return wrapData(response);
}
