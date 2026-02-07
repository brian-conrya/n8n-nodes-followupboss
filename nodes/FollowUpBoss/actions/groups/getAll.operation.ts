import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	wrapData,
} from '../../helpers/utils';

const resource = 'groups';

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	includeDates: false,
	resourceSpecificOptions: [
		{
			displayName: 'Type',
			name: 'type',
			type: 'options',
			options: [
				{
					name: 'Agent',
					value: 'Agent',
				},
				{
					name: 'Lender',
					value: 'Lender',
				},
			],
			default: 'Agent',
			description: 'Agent groups allow admins and agents and Lender groups allow lender role users',
		},
	],
});

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	if (options.type) {
		qs.type = options.type;
	}

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const response = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);
	return wrapData(response, i);
}
