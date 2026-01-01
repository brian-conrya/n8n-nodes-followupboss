import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getPersonIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['removeCollaborators'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'personId',
	},
	{
		displayName: 'Mode',
		name: 'mode',
		type: 'options',
		options: [
			{
				name: 'Remove Specific Collaborators',
				value: 'specific',
			},
			{
				name: 'Remove All Collaborators',
				value: 'all',
			},
		],
		default: 'specific',
		description: 'Whether to remove specific collaborators or all of them',
	},
	{
		displayName: 'Collaborator Names or IDs',
		name: 'collaboratorIds',
		type: 'multiOptions',
		default: [],
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getUsers',
		},
		displayOptions: {
			show: {
				mode: ['specific'],
			},
		},
		description:
			'Collaborators to remove. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const mode = this.getNodeParameter('mode', i) as string;

	let updatedCollaborators: IDataObject[] = [];

	if (mode === 'specific') {
		const collaboratorIds = this.getNodeParameter('collaboratorIds', i) as number[];

		// Get current person data to see existing collaborators
		const person = await apiRequest.call(this, 'GET', `/people/${personId}`);

		const existingCollaborators = person.collaborators || [];

		// Filter out collaborators to remove
		updatedCollaborators = (existingCollaborators as IDataObject[]).filter(
			(c: IDataObject) => !collaboratorIds.includes(c.id as number),
		);
	} else {
		// Remove all collaborators
		updatedCollaborators = [];
	}

	// Update the person with filtered collaborators
	const body = {
		collaborators: updatedCollaborators.map((c: IDataObject) => ({ id: c.id })),
	};

	const response = await apiRequest.call(this, 'PUT', `/people/${personId}`, body);
	return wrapData(response);
}
