import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	simplifyItems,
	toInt,
	wrapData,
	flattenPersonContactInfo,
	getPersonIdProperty,
	updateDisplayOptions,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'id',
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

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'ID', this.getNode(), i);
	const simplify = this.getNodeParameter('simplify', i) as boolean;
	const endpoint = `/people/${id}`;
	const qs = { fields: 'allFields' };

	const response = await apiRequest.call(this, 'GET', endpoint, {}, qs);

	if (simplify) {
		const transformedData = flattenPersonContactInfo(response);
		const simplifiedData = simplifyItems(
			transformedData,
			'id,firstName,lastName,email,phone,stage,tags,source,created,updated'.split(','),
		);
		return wrapData(simplifiedData, i, i);
	}

	return wrapData(response, i, i);
}
