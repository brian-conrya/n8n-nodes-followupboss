import { IDisplayOptions, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { getTagsProperty, normalizeTags, updateDisplayOptions } from '../../helpers/utils';
import { getWebhookPayload, hydrateAndWrap } from './shared';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['webhookEvents'],
		operation: ['filterByTagsCreated'],
	},
};

export const description = updateDisplayOptions(displayOptions, getTagsProperty('Filter by Tags'));

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const { data, uri } = getWebhookPayload.call(this, i);

	if (!data.tags || !(data.tags as string[]).length) return [];

	const tagsMode = this.getNodeParameter('tagsMode', i, 'manual') as string;
	const tags = (data.tags as string[]) || [];

	let filterTags: string[] = [];
	if (tagsMode === 'manual') {
		const tagsManual = this.getNodeParameter('tagsManual', i, '') as string;
		filterTags = normalizeTags(tagsMode, tagsManual, undefined);
	} else {
		const tagsJson = this.getNodeParameter('tagsJson', i, undefined);
		filterTags = normalizeTags(tagsMode, undefined, tagsJson);
	}

	if (filterTags.length > 0) {
		const hasMatchingTag = tags.some((tag) => filterTags.includes(tag));
		if (!hasMatchingTag) return [];
	}

	return hydrateAndWrap.call(this, uri, i);
}
