import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest, apiRequestAllItems } from '../../transport';
import { toInt, updateDisplayOptions, getPersonIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['pauseAutomations'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'personId',
	},
	{
		displayName: 'Pause Mode',
		name: 'pauseMode',
		type: 'options',
		options: [
			{
				name: 'All Automations',
				value: 'all',
				description: 'Pause all active automations for this person',
			},
			{
				name: 'Specific Automations',
				value: 'specific',
				description: 'Pause only selected automations',
			},
		],
		default: 'all',
		required: true,
		description: 'Whether to pause all automations or specific ones',
	},
	{
		displayName: 'Automation Names or IDs',
		name: 'automationIds',
		type: 'multiOptions',
		default: [],
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getAutomations',
		},
		displayOptions: {
			show: {
				pauseMode: ['specific'],
			},
		},
		description:
			'The automations to pause. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const pauseMode = this.getNodeParameter('pauseMode', i) as string;

	// Fetch all automations for this person
	const automationsPeople = await apiRequestAllItems.call(this, '/automationsPeople', { personId });

	// Filter automations based on mode
	let automationsToPause = automationsPeople;

	if (pauseMode === 'specific') {
		const automationIds = this.getNodeParameter('automationIds', i) as number[];
		const runningAutomations = automationsPeople.filter(
			(automation: IDataObject) => automation.status === 'Running',
		);
		automationsToPause = runningAutomations.filter((ap: IDataObject) =>
			automationIds.includes(ap.automationId as number),
		);
	}

	// Pause each automation
	for (const automation of automationsToPause) {
		// Only pause if the automation is running
		if (automation.status === 'Running') {
			await apiRequest.call(this, 'PUT', `/automationsPeople/${automation.id}`, {
				status: 'Paused',
			});
		}
	}

	return [{ json: { paused: true } }];
}
