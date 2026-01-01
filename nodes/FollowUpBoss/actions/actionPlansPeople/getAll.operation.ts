import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	wrapData,
	toInt,
	getPersonIdProperty,
	getActionPlanIdProperty,
} from '../../helpers/utils';

const resource = 'actionPlansPeople';

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions: [
		{
			...getActionPlanIdProperty(false, 'actionPlanId'),
			description: 'ID of the action plan. Choose from the list, or specify an ID.',
		},
		{
			...getPersonIdProperty(false),
			description: 'ID of the person. Choose from the list, or specify an ID.',
		},
	],
});

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	if (options.personId) {
		const personIdRaw = (options.personId as IDataObject).value as string;
		qs.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	}
	if (options.actionPlanId) {
		const actionPlanIdRaw = (options.actionPlanId as IDataObject).value as string;
		qs.actionPlanId = toInt(actionPlanIdRaw, 'Action Plan ID', this.getNode(), i);
	}

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const response = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);
	return wrapData(response);
}
