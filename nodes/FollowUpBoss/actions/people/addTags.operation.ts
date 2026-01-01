import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	toInt,
	updateDisplayOptions,
	wrapData,
	getPersonIdProperty,
	getTagsProperty,
	normalizeTags,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['addTags'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'personId',
	},
	...getTagsProperty(),
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const tagsMode = this.getNodeParameter('tagsMode', i, 'manual') as string;
	let tags: string[] = [];
	if (tagsMode === 'manual') {
		const tagsManual = this.getNodeParameter('tagsManual', i, '') as string;
		tags = normalizeTags(tagsMode, tagsManual, undefined);
	} else {
		const tagsJson = this.getNodeParameter('tagsJson', i, undefined);
		tags = normalizeTags(tagsMode, undefined, tagsJson);
	}

	const body = { tags };
	const qs = { mergeTags: true };
	const response = await apiRequest.call(this, 'PUT', `/people/${personId}`, body, qs);
	return wrapData(response);
}
