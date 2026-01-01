import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	toInt,
	updateDisplayOptions,
	wrapData,
	getPersonIdProperty,
	getActionPlanIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['actionPlansPeople'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		...getActionPlanIdProperty(true, 'actionPlanId'),
		description: 'ID of the action plan. Choose from the list, or specify an ID.',
	},
	{
		...getPersonIdProperty(),
		description: 'ID of the person. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const actionPlanIdRaw = (this.getNodeParameter('actionPlanId', i) as IDataObject).value as string;
	const actionPlanId = toInt(actionPlanIdRaw, 'Action Plan ID', this.getNode(), i);
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);

	const body = { actionPlanId, personId };
	const response = await apiRequest.call(this, 'POST', '/actionPlansPeople', body);
	return wrapData(response);
}
