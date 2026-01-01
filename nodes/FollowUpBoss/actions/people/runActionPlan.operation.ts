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
		resource: ['people'],
		operation: ['runActionPlan'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'personId',
	},
	{
		...getActionPlanIdProperty(true, 'actionPlanId'),
		description: 'The action plan to run. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const actionPlanIdRaw = (this.getNodeParameter('actionPlanId', i) as IDataObject).value as string;
	const actionPlanId = toInt(actionPlanIdRaw, 'Action Plan ID', this.getNode(), i);

	// Run the action plan for this person
	const body = {
		personId: personId,
		actionPlanId,
	};

	const response = await apiRequest.call(this, 'POST', '/actionPlansPeople', body);
	return wrapData(response);
}
