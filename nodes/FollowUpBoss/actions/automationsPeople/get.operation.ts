import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['automationsPeople'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Assignment ID',
		name: 'id',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the Automation-Person pairing to retrieve',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const idRaw = this.getNodeParameter('id', i) as string;
	const id = toInt(idRaw, 'Assignment ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/automationsPeople/${id}`);
	return wrapData(response);
}
