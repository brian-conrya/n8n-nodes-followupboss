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
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getAutomationPersonAssignmentIdProperty(),
		description: 'ID of the Automation-Person pairing. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{
				name: 'Running',
				value: 'Running',
			},
			{
				name: 'Paused',
				value: 'Paused',
			},
		],
		default: 'Running',
		required: true,
		description:
			'Automation Status, i.e. "Paused" to pause the Automation or "Running" to unpause it.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Assignment ID', this.getNode(), i);
	const status = this.getNodeParameter('status', i) as string;

	const body: IDataObject = {
		status,
	};

	const response = await apiRequest.call(this, 'PUT', `/automationsPeople/${id}`, body);
	return wrapData(response);
}
