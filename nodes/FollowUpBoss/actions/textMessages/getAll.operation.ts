import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	NodeOperationError,
} from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	getPersonIdProperty,
	toInt,
	wrapData,
} from '../../helpers/utils';

const resource = 'textMessages';

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions: [
		{
			...getPersonIdProperty(false),
			description:
				'Filter text messages for a specific person ID only. Choose from the list, or specify an ID.',
		},
		{
			displayName: 'To Number',
			name: 'toNumber',
			type: 'string',
			default: '',
			description: "Filter text messages sent to a specific recipient's phone number",
		},
		{
			displayName: 'From Number',
			name: 'fromNumber',
			type: 'string',
			default: '',
			description: "Filter text messages sent from a specific sender's phone number",
		},
	],
});

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	if (!options.personId && !options.toNumber && !options.fromNumber) {
		throw new NodeOperationError(
			this.getNode(),
			'You must provide at least one of "Person ID", "To Number", or "From Number".',
		);
	}

	if (options.personId) {
		const personIdRaw = (options.personId as IDataObject).value as string;
		qs.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	}
	if (options.toNumber) {
		qs.toNumber = options.toNumber;
	}
	if (options.fromNumber) {
		qs.fromNumber = options.fromNumber;
	}
	if (options.offset) {
		qs.offset = options.offset;
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const response = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);
	return wrapData(response);
}
