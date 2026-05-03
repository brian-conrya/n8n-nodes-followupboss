import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../transport';
import { wrapData } from '../../helpers/utils';

export function getWebhookPayload(this: IExecuteFunctions, i: number) {
	const item = this.getInputData()[i];
	const json = item.json;
	const data = (json.data as IDataObject) || {};
	const uri = (json.uri as string) || (data?.uri as string);
	const event = json.event as string;
	return { json, data, uri, event };
}

export async function hydrateFromUri(
	this: IExecuteFunctions,
	uri: string | undefined,
): Promise<IDataObject[]> {
	if (!uri) return [];

	const url = new URL(uri);
	const endpoint = url.pathname.replace(/^\/v1/, '');
	const qs = Object.fromEntries(url.searchParams) as IDataObject;

	const isSingleResource = /\/\d+$/.test(endpoint);
	if (isSingleResource) {
		return [await apiRequest.call(this, 'GET', endpoint, {}, qs)];
	}
	return apiRequestAllItems.call(this, endpoint, qs);
}

export async function hydrateAndWrap(
	this: IExecuteFunctions,
	uri: string | undefined,
	i: number,
): Promise<INodeExecutionData[]> {
	const results = await hydrateFromUri.call(this, uri);
	return wrapData(results, i);
}
