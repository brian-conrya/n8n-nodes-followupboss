import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getPersonIdProperty } from '../../helpers/utils';

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
		description: 'Tags to add to the person',
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
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const tagsData = this.getNodeParameter('tags', i) as { tagValues?: Array<{ tag: string }> };

	// Extract tag values from the fixedCollection structure
	const tags = (tagsData.tagValues || []).map((item) => item.tag).filter((tag) => tag.length > 0);

	if (tags.length === 0) {
		throw new Error('At least one tag must be provided');
	}

	const body = { tags };
	const qs = { mergeTags: true };
	const response = await apiRequest.call(this, 'PUT', `/people/${personId}`, body, qs);
	return wrapData(response);
}
