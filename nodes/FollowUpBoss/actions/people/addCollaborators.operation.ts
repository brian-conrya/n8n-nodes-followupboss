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
		operation: ['addCollaborators'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'personId',
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
		description:
			'Collaborators to add. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const collaboratorIds = this.getNodeParameter('collaboratorIds', i) as number[];

	// Get current person data to see existing collaborators
	const person = await apiRequest.call(this, 'GET', `/people/${personId}`);

	const existingCollaborators = (person.collaborators || []) as Array<{ id: number }>;

	// Combine existing and new collaborators, avoiding duplicates
	const existingIds = new Set(existingCollaborators.map((c: IDataObject) => c.id));
	const newCollaborators = collaboratorIds
		.filter((id) => !existingIds.has(id))
		.map((id) => ({ id: id as number }));

	const updatedCollaborators = [...existingCollaborators, ...newCollaborators];

	// Update the person with new collaborators
	const body = {
		collaborators: updatedCollaborators.map((c: IDataObject) => ({ id: c.id })),
	};

	const response = await apiRequest.call(this, 'PUT', `/people/${personId}`, body);

	return wrapData(response);
}
