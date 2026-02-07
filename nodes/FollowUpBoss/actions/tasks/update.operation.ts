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
	getTaskIdProperty,
	getUserIdProperty,
	getPersonIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['tasks'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getTaskIdProperty(),
		name: 'taskId',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
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
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the task',
			},
			{
				...getPersonIdProperty(),
				name: 'personId',
				required: false,
				description:
					'ID of the person this task is related to. Choose from the list, or specify an ID.',
			},
			{
				displayName: 'Remind Seconds Before',
				name: 'remindSecondsBefore',
				type: 'string',
				default: '',
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
	const taskIdRaw = (this.getNodeParameter('taskId', i) as IDataObject).value as string;
	const taskId = toInt(taskIdRaw, 'Task ID', this.getNode(), i);
	const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.assignedUserId) {
		const assignedUserIdRaw = (updateFields.assignedUserId as IDataObject).value as string;
		body.assignedUserId = toInt(assignedUserIdRaw, 'Assigned User ID', this.getNode(), i);
		delete updateFields.assignedUserId;
	}
	if (updateFields.personId) {
		const personIdRaw = (updateFields.personId as IDataObject).value as string;
		body.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
		delete updateFields.personId;
	}

	Object.assign(body, updateFields);

	const response = await apiRequest.call(this, 'PUT', `/tasks/${taskId}`, body);
	return wrapData(response, i);
}
