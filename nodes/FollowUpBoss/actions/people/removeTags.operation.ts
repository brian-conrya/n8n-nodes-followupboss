import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['removeTags'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Person ID',
		name: 'personId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the person',
	},
	{
		displayName: 'Tags',
		name: 'tags',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {
			tagValues: [{ tag: '' }],
		},
		placeholder: 'Add Tag',
		description: 'Tags to remove from the person',
		options: [
			{
				displayName: 'Tag',
				name: 'tagValues',
				values: [
					{
						displayName: 'Tag',
						name: 'tag',
						type: 'string',
						default: '',
						description: 'Tag name',
					},
				],
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const personIdRaw = this.getNodeParameter('personId', i) as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const tagsData = this.getNodeParameter('tags', i) as { tagValues?: Array<{ tag: string }> };

	// Extract tag values from the fixedCollection structure
	const tagsToRemove = (tagsData.tagValues || [])
		.map((item) => item.tag)
		.filter((tag) => tag.length > 0);

	if (tagsToRemove.length === 0) {
		throw new Error('At least one tag must be provided');
	}

	// Get current tags
	const currentPerson = await apiRequest.call(this, 'GET', `/people/${personId}`, {}, { fields: 'tags' });
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
