import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getPersonIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['changeStage'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'personId',
	},
	{
		displayName: 'Stage Name or ID',
		name: 'stage',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getStages',
		},
		default: '',
		required: true,
		description:
			'The new stage for the person. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const personIdRaw = this.getNodeParameter('personId', i) as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const stage = toInt(this.getNodeParameter('stage', i) as string, 'Stage', this.getNode(), i);
	const body = { stage };
	const response = await apiRequest.call(this, 'PUT', `/people/${personId}`, body);
	return wrapData(response);
}
