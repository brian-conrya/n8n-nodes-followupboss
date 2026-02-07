import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['checkDuplicate'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		default: '',
		description: 'Email to check',
	},
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		default: '',
		description: 'Phone number to check',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const email = this.getNodeParameter('email', i) as string;
	const phone = this.getNodeParameter('phone', i) as string;
	const qs: IDataObject = {};
	if (email) qs.email = email;
	if (phone) qs.phone = phone;

	const response = await apiRequest.call(this, 'GET', '/people/checkDuplicate', {}, qs);
	return wrapData(response, i);
}
