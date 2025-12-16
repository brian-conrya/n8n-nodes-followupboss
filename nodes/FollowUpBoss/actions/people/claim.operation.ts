import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['claim'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Person ID',
		name: 'id',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the person to claim',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Person ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'POST', '/people/claim', {}, { id });
	return wrapData(response);
}

