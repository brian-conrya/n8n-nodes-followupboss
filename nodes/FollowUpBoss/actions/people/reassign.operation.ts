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
	getPersonIdProperty,
	getAgentIdProperty,
	getLenderIdProperty,
	getGroupIdProperty,
	getPondIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['reassign'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'personId',
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
		...getAgentIdProperty(true, 'agentId'),
		displayOptions: {
			show: {
				assignmentType: ['assignAgent'],
			},
		},
		description: 'The agent to assign. Choose from the list, or specify an ID.',
	},
	{
		...getLenderIdProperty('Lender', 'lenderId', true),
		displayOptions: {
			show: {
				assignmentType: ['assignLender'],
			},
		},
		description: 'The lender to assign. Choose from the list, or specify an ID.',
	},
	{
		...getGroupIdProperty(true),
		displayOptions: {
			show: {
				assignmentType: ['assignGroup'],
			},
		},
		description: 'The group to assign. Choose from the list, or specify an ID.',
	},
	{
		...getPondIdProperty(true),
		displayOptions: {
			show: {
				assignmentType: ['assignPond'],
			},
		},
		description: 'The pond to assign. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const assignmentType = this.getNodeParameter('assignmentType', i) as string;

	const body: IDataObject = {};

	if (assignmentType === 'assignAgent') {
		body.assignedUserId = (this.getNodeParameter('agentId', i) as IDataObject).value as string;
	} else if (assignmentType === 'assignLender') {
		body.assignedLenderId = (this.getNodeParameter('lenderId', i) as IDataObject).value as string;
	} else if (assignmentType === 'removeLender') {
		body.assignedLenderId = null;
	} else if (assignmentType === 'assignGroup') {
		body.groupId = (this.getNodeParameter('groupId', i) as IDataObject).value as string;
	} else if (assignmentType === 'assignPond') {
		body.pondId = (this.getNodeParameter('pondId', i) as IDataObject).value as string;
	}

	const response = await apiRequest.call(this, 'PUT', `/people/${personId}`, body);
	return wrapData(response);
}
