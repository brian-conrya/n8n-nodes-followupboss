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
		operation: ['removeTags'],
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
	let tagsToRemove: string[] = [];
	if (tagsMode === 'manual') {
		const tagsManual = this.getNodeParameter('tagsManual', i, '') as string;
		tagsToRemove = normalizeTags(tagsMode, tagsManual, undefined);
	} else {
		const tagsJson = this.getNodeParameter('tagsJson', i, undefined);
		tagsToRemove = normalizeTags(tagsMode, undefined, tagsJson);
	}

	// Get current tags
	const currentPerson = await apiRequest.call(
		this,
		'GET',
		`/people/${personId}`,
		{},
		{ fields: 'tags' },
	);
	const currentTags = (currentPerson.tags as string[] | undefined) || [];

	// Filter out tags to remove
	const newTags = currentTags.filter((tag) => !tagsToRemove.includes(tag));

	// Update if changed
	if (newTags.length !== currentTags.length) {
		const body = { tags: newTags };
		const response = await apiRequest.call(this, 'PUT', `/people/${personId}`, body);
		return wrapData(response);
	}

	// No changes needed, return current person data
	return wrapData(currentPerson);
}
