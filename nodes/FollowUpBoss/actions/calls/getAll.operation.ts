import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	getPersonIdProperty,
	toInt,
	wrapData,
} from '../../helpers/utils';

const resource = 'calls';

const resourceSpecificOptions: INodeProperties[] = [
	{
		displayName: 'From Number',
		name: 'fromNumber',
		type: 'string',
		default: '',
		description: 'Filter calls based on the number that the call was from',
	},
	{
		...getPersonIdProperty(false),
		description: 'Filter by Person ID. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		default: '',
		description:
			'Filter calls based on the phone number of a specific person or lead (finds calls regardless of whether they were incoming or outgoing)',
	},
	{
		displayName: 'To Number',
		name: 'toNumber',
		type: 'string',
		default: '',
		description: 'Filter calls based on the number that the call was to',
	},
];

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions,
});

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	if (options.fromNumber) {
		qs.fromNumber = options.fromNumber;
	}

	if (options.personId) {
		const personIdRaw = (options.personId as IDataObject).value as string;
		qs.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	}

	if (options.phone) {
		qs.phone = options.phone;
	}

	if (options.toNumber) {
		qs.toNumber = options.toNumber;
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const calls = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);

	return wrapData(calls);
}
