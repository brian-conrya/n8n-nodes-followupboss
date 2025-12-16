import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties, NodeApiError } from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../transport';
import { simplifyItems, toInt, updateDisplayOptions, wrapData, flattenPersonContactInfo } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'By',
		name: 'by',
		type: 'options',
		options: [
			{
				name: 'ID',
				value: 'id',
			},
			{
				name: 'Email',
				value: 'email',
			},
		],
		default: 'id',
		description: 'The field to search by',
	},
	{
		displayName: 'ID',
		name: 'id',
		type: 'string',
		displayOptions: {
			show: {
				by: ['id'],
			},
		},
		default: '',
		required: true,
		description: 'The ID to search for',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		displayOptions: {
			show: {
				by: ['email'],
			},
		},
		default: '',
		placeholder: 'name@email.com',
		required: true,
		description: 'The email to search for',
	},
	{
		displayName: 'Simplify',
		name: 'simplify',
		type: 'boolean',
		default: false,
		description: 'Whether to return a simplified version of the response instead of the raw data',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const by = this.getNodeParameter('by', i) as string;
	let endpoint = '';
	let qs = {};

	if (by === 'id') {
		const idRaw = this.getNodeParameter('id', i) as string;
		const id = toInt(idRaw, 'ID', this.getNode(), i);
		const simplify = this.getNodeParameter('simplify', i) as boolean;
		endpoint = `/people/${id}`;
		qs = { fields: 'allFields' };
		const response = await apiRequest.call(this, 'GET', endpoint, {}, qs);

		if (simplify) {
			const transformedData = flattenPersonContactInfo(response);
			const simplifiedData = simplifyItems(
				transformedData,
				'id,firstName,lastName,email,phone,stage,tags,source,created,updated'.split(','),
			);
			return wrapData(simplifiedData);
		}

		return wrapData(response);
	}

	const email = this.getNodeParameter('email', i) as string;
	const simplify = this.getNodeParameter('simplify', i) as boolean;
	endpoint = '/people';
	qs = { email, fields: 'allFields' };
	const response = await apiRequestAllItems.call(this, '/people', qs, 1);

	if (response.length === 0) {
		throw new NodeApiError(this.getNode(), { message: 'Requested resource was not found.' });
	}

	if (simplify) {
		const transformedData = flattenPersonContactInfo(response[0]);
		const simplifiedData = simplifyItems(
			transformedData,
			'id,firstName,lastName,email,phone,stage,tags,source,created,updated'.split(','),
		);
		return wrapData(simplifiedData);
	}

	return wrapData(response[0]);
}
