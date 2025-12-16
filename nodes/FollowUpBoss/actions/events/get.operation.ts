import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['events'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Event ID',
		name: 'eventId',
		type: 'string',
		required: true,
		default: '',
		description: 'ID of the event to retrieve',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const eventIdRaw = this.getNodeParameter('eventId', i) as string;
	const eventId = toInt(eventIdRaw, 'Event ID', this.getNode(), i);

	const response = await apiRequest.call(this, 'GET', `/events/${eventId}`);
	return wrapData(response);
}

