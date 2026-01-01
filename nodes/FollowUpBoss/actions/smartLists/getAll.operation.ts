import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	wrapData,
} from '../../helpers/utils';

const resource = 'smartLists';

const resourceSpecificOptions: INodeProperties[] = [
	{
		displayName: 'FUB2',
		name: 'fub2',
		type: 'boolean',
		default: true,
		description:
			'Whether to return Smart Lists created in the current version of the UI. By default, only Smart Lists created in the classic version are returned.',
	},
	{
		displayName: 'All',
		name: 'all',
		type: 'boolean',
		default: false,
		description: 'Whether to show all smart lists, whether from FUB Classic or FUB',
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

	let typeSelected: boolean = false;
	if (options.fub2) {
		typeSelected = true;
		qs.fub2 = options.fub2;
	}
	if (options.all) {
		typeSelected = true;
		qs.all = options.all;
	}
	if (!typeSelected) {
		// Use FUB2 unless something else was specifically selected.
		qs.fub2 = true;
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const response = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);
	return wrapData(response);
}
