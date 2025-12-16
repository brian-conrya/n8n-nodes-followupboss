import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['reassign'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Person ID',
		name: 'personId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the person',
	},
	{
		displayName: 'Assignment Type',
		name: 'assignmentType',
		type: 'options',
		options: [
			{
				name: 'Assign Agent',
				value: 'assignAgent',
				description: 'Assign an agent to this person',
			},
			{
				name: 'Assign Group',
				value: 'assignGroup',
				description: 'Assign this person to a group',
			},
			{
				name: 'Assign Lender',
				value: 'assignLender',
				description: 'Assign a lender to this person',
			},
			{
				name: 'Assign Pond',
				value: 'assignPond',
				description: 'Assign this person to a pond',
			},
			{
				name: 'Remove Lender',
				value: 'removeLender',
				description: 'Remove the assigned lender from this person',
			},
		],
		default: 'assignAgent',
		required: true,
		description: 'What type of assignment to perform',
	},
	{
		displayName: 'Agent Name or ID',
		name: 'agentId',
		type: 'options',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getAgents',
		},
		displayOptions: {
			show: {
				assignmentType: ['assignAgent'],
			},
		},
		description:
			'The agent to assign. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Lender Name or ID',
		name: 'lenderId',
		type: 'options',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getLenders',
		},
		displayOptions: {
			show: {
				assignmentType: ['assignLender'],
			},
		},
		description:
			'The lender to assign. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Group Name or ID',
		name: 'groupId',
		type: 'options',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getGroups',
		},
		displayOptions: {
			show: {
				assignmentType: ['assignGroup'],
			},
		},
		description:
			'The group to assign. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
	{
		displayName: 'Pond Name or ID',
		name: 'pondId',
		type: 'options',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getPonds',
		},
		displayOptions: {
			show: {
				assignmentType: ['assignPond'],
			},
		},
		description:
			'The pond to assign. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const personIdRaw = this.getNodeParameter('personId', i) as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const assignmentType = this.getNodeParameter('assignmentType', i) as string;

	const body: IDataObject = {};

	if (assignmentType === 'assignAgent') {
		const agentIdRaw = this.getNodeParameter('agentId', i) as string;
		body.assignedUserId = toInt(agentIdRaw, 'Agent ID', this.getNode(), i);
	} else if (assignmentType === 'assignLender') {
		const lenderIdRaw = this.getNodeParameter('lenderId', i) as string;
		body.assignedLenderId = toInt(lenderIdRaw, 'Lender ID', this.getNode(), i);
	} else if (assignmentType === 'removeLender') {
		body.assignedLenderId = null;
	} else if (assignmentType === 'assignGroup') {
		const groupIdRaw = this.getNodeParameter('groupId', i) as string;
		body.groupId = toInt(groupIdRaw, 'Group ID', this.getNode(), i);
	} else if (assignmentType === 'assignPond') {
		const pondIdRaw = this.getNodeParameter('pondId', i) as string;
		body.pondId = toInt(pondIdRaw, 'Pond ID', this.getNode(), i);
	}

	const response = await apiRequest.call(this, 'PUT', `/people/${personId}`, body);
	return wrapData(response);
}
