import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	getPersonIdProperty,
	toInt,
	wrapData,
} from '../../helpers/utils';

const resource = 'events';

const resourceSpecificOptions: INodeProperties[] = [
	{
		...getPersonIdProperty(false),
		description: 'Find all events related to a person. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'multiOptions',
		options: [
			{ name: 'General Inquiry', value: 'General Inquiry' },
			{ name: 'Incoming Call', value: 'Incoming Call' },
			{ name: 'Inquiry', value: 'Inquiry' },
			{ name: 'Property Inquiry', value: 'Property Inquiry' },
			{ name: 'Property Search', value: 'Property Search' },
			{ name: 'Registration', value: 'Registration' },
			{ name: 'Saved Property', value: 'Saved Property' },
			{ name: 'Saved Property Search', value: 'Saved Property Search' },
			{ name: 'Seller Inquiry', value: 'Seller Inquiry' },
			{ name: 'Unsubscribed', value: 'Unsubscribed' },
			{ name: 'Viewed Page', value: 'Viewed Page' },
			{ name: 'Viewed Property', value: 'Viewed Property' },
			{ name: 'Visited Open House', value: 'Visited Open House' },
			{ name: 'Visited Website', value: 'Visited Website' },
		],
		default: [],
		description: 'Filter events by type',
	},
	{
		displayName: 'Has Property',
		name: 'hasProperty',
		type: 'boolean',
		default: false,
		description: 'Whether to filter based on whether a property is associated with an event or not',
	},
	{
		displayName: 'Property Address',
		name: 'propertyAddress',
		type: 'string',
		default: '',
		description: 'Searches property addresses for a given value, including partial matches',
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

	if (options.personId) {
		const personIdRaw = (options.personId as IDataObject).value as string;
		qs.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	}
	if (options.type && (options.type as string[]).length > 0) {
		qs.type = (options.type as string[]).join(',');
	}
	if (options.hasProperty) {
		qs.hasProperty = options.hasProperty;
	}
	if (options.propertyAddress) {
		qs.propertyAddress = options.propertyAddress;
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const events = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);

	return wrapData(events);
}
