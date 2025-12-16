import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['peopleRelationships'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Owner ID',
		name: 'ownerId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 12345',
		description: 'ID of the owner person',
	},
	{
		displayName: 'Related Person ID',
		name: 'relatedPersonId',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. 67890',
		description: 'ID of the related person',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Spouse',
		description: 'Type of the relationship (e.g. Spouse, Child)',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const ownerIdRaw = this.getNodeParameter('ownerId', i) as string;
	const ownerId = toInt(ownerIdRaw, 'Owner ID', this.getNode(), i);
	const relatedPersonIdRaw = this.getNodeParameter('relatedPersonId', i) as string;
	const relatedPersonId = toInt(relatedPersonIdRaw, 'Related Person ID', this.getNode(), i);
	const type = this.getNodeParameter('type', i) as string;
	const body = { ownerId, relatedPersonId, type };
	const response = await apiRequest.call(this, 'POST', '/peopleRelationships', body);
	return wrapData(response);
}
