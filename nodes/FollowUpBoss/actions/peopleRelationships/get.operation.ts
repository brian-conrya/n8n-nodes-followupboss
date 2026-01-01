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
	getRelationshipIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['peopleRelationships'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getRelationshipIdProperty(),
		description: 'ID of the relationship to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const relationshipIdRaw = (this.getNodeParameter('relationshipId', i) as IDataObject)
		.value as string;
	const relationshipId = toInt(relationshipIdRaw, 'Relationship ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/peopleRelationships/${relationshipId}`);
	return wrapData(response);
}
