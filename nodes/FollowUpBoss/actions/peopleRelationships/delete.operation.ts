import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapDeleteSuccess } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['peopleRelationships'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'People Relationship ID',
		name: 'id',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the people relationship to delete',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'People Relationship ID', this.getNode(), i);
	await apiRequest.call(this, 'DELETE', `/peopleRelationships/${id}`);
	return wrapDeleteSuccess();
}

