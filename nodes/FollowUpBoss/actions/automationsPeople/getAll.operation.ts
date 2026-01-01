import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	wrapData,
	toInt,
	getPersonIdProperty,
	getAutomationIdProperty,
} from '../../helpers/utils';

const resource = 'automationsPeople';

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions: [
		{
			...getPersonIdProperty(false),
			description:
				'ID of a Person (i.e. to view only pairings for that Person). Choose from the list, or specify an ID.',
		},
		{
			...getAutomationIdProperty(false, 'automationId'),
			description:
				'ID of an Automation (i.e. to view only pairings for that Automation). Choose from the list, or specify an ID.',
		},
		{
			displayName: 'Status',
			name: 'status',
			type: 'options',
			options: [
				{
					name: 'Completed',
					value: 'Completed',
				},
				{
					name: 'Initial',
					value: 'Initial',
				},
				{
					name: 'Paused',
					value: 'Paused',
				},
				{
					name: 'Running',
					value: 'Running',
				},
			],
			default: 'Running',
			description: 'Automation Status to filter by',
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
	if (options.automationId) {
		const automationIdRaw = (options.automationId as IDataObject).value as string;
		qs.automationId = toInt(automationIdRaw, 'Automation ID', this.getNode(), i);
	}

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const automationsPeople = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);

	return wrapData(automationsPeople);
}
