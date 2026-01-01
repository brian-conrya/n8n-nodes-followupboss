import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	wrapData,
} from '../../helpers/utils';

const resource = 'emailMarketingCampaigns';

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions: [
		{
			displayName: 'Origin',
			name: 'origin',
			type: 'string',
			default: '',
			description: 'Search for campaigns from a specific origin',
		},
		{
			displayName: 'Origin ID',
			name: 'originId',
			type: 'string',
			default: '',
			description: 'Search for campaigns with a specific ID from the originating system',
		},
	],
});

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	if (options.origin) qs.origin = options.origin;
	if (options.originId) qs.originId = options.originId;

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const response = await apiRequestAllItems.call(this, '/emCampaigns', qs, limit);
	return wrapData(response);
}
