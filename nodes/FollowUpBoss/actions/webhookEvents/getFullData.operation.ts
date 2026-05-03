import { IDisplayOptions, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { updateDisplayOptions } from '../../helpers/utils';
import { getWebhookPayload, hydrateAndWrap } from './shared';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhookEvents'],
		operation: ['getFullData'],
	},
};

export const description = updateDisplayOptions(displayOptions, []);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const { uri } = getWebhookPayload.call(this, i);
	return hydrateAndWrap.call(this, uri, i);
}
