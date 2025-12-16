import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	toInt,
	wrapData,
} from '../../helpers/utils';

const resource = 'tasks';

const resourceSpecificOptions: INodeProperties[] = [
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
		displayName: 'Due',
		name: 'due',
		type: 'options',
		options: [
			{
				name: 'Overdue',
				value: 'overdue',
			},
			{
				name: 'Today',
				value: 'today',
			},
			{
				name: 'Upcoming',
				value: 'upcoming',
			},
		],
		default: 'today',
		description: 'Find tasks that fall into the following ranges: today, overdue and upcoming',
	},
	{
		displayName: 'Due End',
		name: 'dueEnd',
		type: 'dateTime',
		default: '',
		description: 'Find tasks that are due from this time and before',
	},
	{
		displayName: 'Due Start',
		name: 'dueStart',
		type: 'dateTime',
		default: '',
		description: 'Finds tasks that are due from this time forward',
	},
	{
		displayName: 'Is Completed',
		name: 'isCompleted',
		type: 'boolean',
		default: false,
		description: 'Whether to find tasks that have been completed or not completed',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		description: 'Find tasks where the name is like what you pass in',
	},
	{
		displayName: 'Person ID',
		name: 'personId',
		type: 'string',
		default: '',
		description: 'Find tasks by a person\'s ID',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'multiOptions',
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
		default: [],
		description: 'Find tasks by type',
	},
];

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions,
});

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	if (options.assignedUser) {
		const assignedUser = options.assignedUser as string | number;
		if (typeof assignedUser === 'number' || !isNaN(Number(assignedUser))) {
			qs.assignedUserId = assignedUser;
		} else {
			qs.assignedTo = assignedUser;
		}
	}
	if (options.due) {
		qs.due = options.due;
	}
	if (options.dueEnd) {
		qs.dueEnd = options.dueEnd;
	}
	if (options.dueStart) {
		qs.dueStart = options.dueStart;
	}
	if (options.isCompleted !== undefined) {
		qs.isCompleted = options.isCompleted;
	}
	if (options.name) {
		qs.name = options.name;
	}
	if (options.personId) {
		qs.personId = toInt(options.personId as string, 'Person ID', this.getNode(), i);
	}
	if (options.type) {
		qs.type = (options.type as string[]).join(',');
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const response = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);
	return wrapData(response);
}
