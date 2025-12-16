import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['tasks'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		default: '',
		required: true,
		description: 'ID of the task to update',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Assigned User Name or ID',
				name: 'assignedUser',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getUsers',
				},
				default: '',
				description:
					'Choose from the list, or specify an ID or Full Name using an expression. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
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
				displayName: 'Person ID',
				name: 'personId',
				type: 'string',
				default: '',
				description: 'ID of the person this task is related to',
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
	index: number,
): Promise<INodeExecutionData[]> {
	const taskIdRaw = this.getNodeParameter('taskId', index) as string;
	const taskId = toInt(taskIdRaw, 'Task ID', this.getNode(), index);
	const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

	const body: IDataObject = {};

	if (updateFields.assignedUser) {
		const assignedUser = updateFields.assignedUser as string | number;
		if (typeof assignedUser === 'number' || !isNaN(Number(assignedUser))) {
			body.assignedUserId = assignedUser;
		} else {
			body.assignedTo = assignedUser;
		}
		delete updateFields.assignedUser;
	}

	Object.assign(body, updateFields);

	const response = await apiRequest.call(this, 'PUT', `/tasks/${taskId}`, body);
	return wrapData(response);
}
