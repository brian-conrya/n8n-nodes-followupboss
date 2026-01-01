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
	getAutomationIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['automationsPeople'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		description:
			'ID of the person to assign the automation to. Choose from the list, or specify an ID.',
	},
	{
		...getAutomationIdProperty(true, 'automationId', true),
		description: 'ID of the automation to assign. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const automationIdRaw = (this.getNodeParameter('automationId', i) as IDataObject).value as string;
	const automationId = toInt(automationIdRaw, 'Automation ID', this.getNode(), i);

	const body = {
		personId,
		automationId,
	};

	const response = await apiRequest.call(this, 'POST', '/automationsPeople', body);
	return wrapData(response);
}
