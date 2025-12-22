import { IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getPersonIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['runAutomation'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'personId',
	},
	{
		displayName: 'Automation Name or ID',
		name: 'automationId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getAutomations',
		},
		default: '',
		required: true,
		description:
			'The automation to run. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const personIdRaw = this.getNodeParameter('personId', i) as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const automationId = toInt(this.getNodeParameter('automationId', i) as string, 'Automation ID', this.getNode(), i);

	// Run the automation for this person
	const body = {
		personId: personId,
		automationId,
	};

	const response = await apiRequest.call(this, 'POST', '/automationsPeople', body);
	return wrapData(response);
}
