import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	wrapData,
} from '../../helpers/utils';

const resource = 'automations';

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions: [
		{
			displayName: 'Status',
			name: 'status',
			type: 'options',
			options: [
				{
					name: 'Active',
					value: 'Active',
				},
				{
					name: 'Deleted',
					value: 'Deleted',
				},
				{
					name: 'Disabled',
					value: 'Disabled',
				},
			],
			default: 'Active',
			description: 'Search for Automations with one of the following statuses',
		},
		{
			displayName: 'Enabled Only',
			name: 'enabledOnly',
			type: 'boolean',
			default: false,
			description: 'Whether to return only automations that are enabled',
		},
		{
			displayName: 'Manual Only',
			name: 'manualOnly',
			type: 'boolean',
			default: false,
			description: 'Whether to return automations that contain a manual trigger',
		},
	],
});

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const response = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);
	return wrapData(response, i);
}
