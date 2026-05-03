import {
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { updateDisplayOptions } from '../../helpers/utils';
import { getWebhookPayload, hydrateAndWrap } from './shared';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhookEvents'],
		operation: ['filterByStageUpdated'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Filter by Stage',
		name: 'stageFilter',
		type: 'multiOptions',
		default: [],
		typeOptions: {
			loadOptionsMethod: 'getStageNames',
		},
		description:
			'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const { data, uri } = getWebhookPayload.call(this, i);

	if (!data.stage) return [];

	const stageFilter = this.getNodeParameter('stageFilter', i, []) as string[];
	const stage = data.stage as string;

	if (stageFilter.length > 0 && (!stage || !stageFilter.includes(stage))) {
		return [];
	}

	return hydrateAndWrap.call(this, uri, i);
}
