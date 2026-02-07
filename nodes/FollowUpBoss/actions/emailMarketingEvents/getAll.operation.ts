import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	getPersonIdProperty,
	toInt,
	wrapData,
} from '../../helpers/utils';

const resource = 'emailMarketingEvents';

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions: [
		{
			displayName: 'Type',
			name: 'type',
			type: 'options',
			options: [
				{ name: 'Bounced', value: 'bounced' },
				{ name: 'Click', value: 'click' },
				{ name: 'Delivered', value: 'delivered' },
				{ name: 'Dropped', value: 'dropped' },
				{ name: 'Hard Bounce', value: 'hard-bounce' },
				{ name: 'Open', value: 'open' },
				{ name: 'Soft Bounce', value: 'soft-bounce' },
				{ name: 'Spam Report', value: 'spamreport' },
				{ name: 'Unsubscribe', value: 'unsubscribe' },
			],
			default: 'delivered',
			description: 'Find email marketing events based on type',
		},
		{
			...getPersonIdProperty(false),
			description:
				'Find email marketing events by person ID. Choose from the list, or specify an ID.',
		},
	],
});

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	if (options.type) qs.type = options.type;
	if (options.personId) {
		const personIdRaw = (options.personId as IDataObject).value as string;
		qs.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const response = await apiRequestAllItems.call(this, '/emEvents', qs, limit);
	return wrapData(response, i);
}
