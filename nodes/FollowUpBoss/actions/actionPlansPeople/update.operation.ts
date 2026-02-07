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
	getActionPlanPersonAssignmentIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['actionPlansPeople'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getActionPlanPersonAssignmentIdProperty(),
		description: 'ID of the action plan person record. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
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
				description: 'The desired state of the applied action plan',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Action Plan Person ID', this.getNode(), i);
	const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

	const body = { ...updateFields };
	const response = await apiRequest.call(this, 'PUT', `/actionPlansPeople/${id}`, body);
	return wrapData(response, i);
}
