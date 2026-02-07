import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getEventIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['events'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getEventIdProperty(),
		description: 'ID of the event to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const eventIdRaw = (this.getNodeParameter('eventId', i) as IDataObject).value as string;
	const eventId = toInt(eventIdRaw, 'Event ID', this.getNode(), i);

	const response = await apiRequest.call(this, 'GET', `/events/${eventId}`);
	return wrapData(response, i);
}
