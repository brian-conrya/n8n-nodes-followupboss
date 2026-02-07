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
	getAutomationPersonAssignmentIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['automationsPeople'],
		operation: ['get'],
	},
};

const properties: INodeProperties[] = [
	{
		...getAutomationPersonAssignmentIdProperty(),
		description:
			'ID of the Automation-Person pairing to retrieve. Choose from the list, or specify an ID.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Assignment ID', this.getNode(), i);
	const response = await apiRequest.call(this, 'GET', `/automationsPeople/${id}`);
	return wrapData(response, i);
}
