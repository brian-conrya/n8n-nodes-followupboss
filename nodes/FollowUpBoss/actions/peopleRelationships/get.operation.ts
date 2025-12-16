import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['peopleRelationships'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Relationship ID',
		name: 'relationshipId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the relationship to retrieve',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const relationshipIdRaw = this.getNodeParameter('relationshipId', i) as string;
	const relationshipId = toInt(relationshipIdRaw, 'Relationship ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/peopleRelationships/${relationshipId}`);
	return wrapData(response);
}
