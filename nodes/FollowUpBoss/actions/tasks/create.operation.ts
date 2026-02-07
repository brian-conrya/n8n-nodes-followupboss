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
	getUserIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['tasks'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPersonIdProperty(),
		name: 'personId',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'e.g. Follow up call',
		description: 'Name of the task',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				...getUserIdProperty('Assigned User', 'assignedUserId', false),
				description: 'The user assigned to this task. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'Due Date',
				name: 'dueDate',
				type: 'dateTime',
				default: '',
				description: 'Due date for this task in YYYY-MM-DD format',
			},
			{
				displayName: 'Due Date Time',
				name: 'dueDateTime',
				type: 'dateTime',
				default: '',
				description:
					'Due date for this task with a time included that also supports timezone suffixes. (e.g., 2004-11-16T03:00:00 -05:00).',
			},
			{
				displayName: 'Is Completed',
				name: 'isCompleted',
				type: 'boolean',
				default: false,
				description: 'Whether to set the task as completed or not',
			},
			{
				displayName: 'Remind Seconds Before',
				name: 'remindSecondsBefore',
				type: 'string',
				default: '',
				placeholder: 'e.g. 3600',
				description:
					'Set a reminder for the task to be sent via email and desktop notification. This is only available for tasks with a due time set.',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{
						name: 'Appointment',
						value: 'Appointment',
					},
					{
						name: 'Call',
						value: 'Call',
					},
					{
						name: 'Closing',
						value: 'Closing',
					},
					{
						name: 'Email',
						value: 'Email',
					},
					{
						name: 'Follow Up',
						value: 'Follow Up',
					},
					{
						name: 'Open House',
						value: 'Open House',
					},
					{
						name: 'Showing',
						value: 'Showing',
					},
					{
						name: 'Text',
						value: 'Text',
					},
					{
						name: 'Thank You',
						value: 'Thank You',
					},
				],
				default: 'Follow Up',
				description: 'Type of the task',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	const name = this.getNodeParameter('name', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	const body: IDataObject = {
		personId,
		name,
	};

	if (additionalFields.assignedUserId) {
		const assignedUserIdRaw = (additionalFields.assignedUserId as IDataObject).value as string;
		body.assignedUserId = toInt(assignedUserIdRaw, 'Assigned User ID', this.getNode(), i);
		delete additionalFields.assignedUserId;
	}

	Object.assign(body, additionalFields);

	const response = await apiRequest.call(this, 'POST', '/tasks', body);
	return wrapData(response, i);
}
