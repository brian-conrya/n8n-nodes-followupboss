import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	wrapData,
} from '../../helpers/utils';

const resource = 'actionPlans';

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
					name: 'Active,Deleted',
					value: 'Active,Deleted',
				},
			],
			default: 'Active',
			description: 'Search for Action Plans with one of the following statuses',
		},
		{
			displayName: 'Names',
			name: 'names',
			type: 'fixedCollection',
			typeOptions: {
				multipleValues: true,
			},
			default: {},
			placeholder: 'Add Name',
			options: [
				{
					displayName: 'Name',
					name: 'names',
					values: [
						{
							displayName: 'Name',
							name: 'name',
							type: 'string',
							default: '',
						},
					],
				},
			],
			description: 'Search for Action Plans by name',
		},
	],
});

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	if (options.status) qs.status = options.status;
	if (options.names) {
		const namesCollection = options.names as IDataObject;
		if (namesCollection.names) {
			const namesList = namesCollection.names as IDataObject[];
			qs['names[]'] = namesList.map((item) => item.name as string);
		}
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const response = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);
	return wrapData(response);
}
