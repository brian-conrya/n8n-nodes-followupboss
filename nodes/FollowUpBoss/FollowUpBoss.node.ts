import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionTypes,
} from 'n8n-workflow';

import * as actionPlans from './actions/actionPlans';
import * as actionPlansPeople from './actions/actionPlansPeople';
import * as appointmentOutcomes from './actions/appointmentOutcomes';
import * as appointments from './actions/appointments';
import * as appointmentTypes from './actions/appointmentTypes';
import * as automations from './actions/automations';
import * as automationsPeople from './actions/automationsPeople';
import * as calls from './actions/calls';
import * as customFields from './actions/customFields';
import * as dealAttachments from './actions/dealAttachments';
import * as dealCustomFields from './actions/dealCustomFields';
import * as deals from './actions/deals';
import * as emailMarketingCampaigns from './actions/emailMarketingCampaigns';
import * as emailMarketingEvents from './actions/emailMarketingEvents';
import * as emailTemplates from './actions/emailTemplates';
import * as events from './actions/events';
import * as groups from './actions/groups';
import * as identity from './actions/identity';
import * as notes from './actions/notes';
import * as people from './actions/people';
import * as peopleRelationships from './actions/peopleRelationships';
import * as personAttachments from './actions/personAttachments';
import * as pipelines from './actions/pipelines';
import * as ponds from './actions/ponds';
import * as reactions from './actions/reactions';
import * as smartLists from './actions/smartLists';
import * as stages from './actions/stages';
import * as tasks from './actions/tasks';
import * as teamInboxes from './actions/teamInboxes';
import * as teams from './actions/teams';
import * as textMessages from './actions/textMessages';
import * as textMessageTemplates from './actions/textMessageTemplates';
import * as threadedReplies from './actions/threadedReplies';
import * as timeframes from './actions/timeframes';
import * as users from './actions/users';
import * as methods from './methods';
import { router } from './actions/router';

export class FollowUpBoss implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Follow Up Boss',
		name: 'followUpBoss',
		icon: 'file:FollowUpBoss.svg',
		group: ['transform'],
		version: 1,
		subtitle: '',
		description: 'Interact with the Follow Up Boss API',
		documentationUrl:
			'https://github.com/brian-conrya/n8n-nodes-followupboss/blob/main/nodes/FollowUpBoss/FollowUpBoss.md',
		defaults: {
			name: 'Follow Up Boss',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [{ name: 'followUpBossApi', required: true }],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Action Plan',
						value: 'actionPlans',
					},
					{
						name: 'Action Plan Assignment',
						value: 'actionPlansPeople',
					},
					{
						name: 'Appointment',
						value: 'appointments',
					},
					{
						name: 'Appointment Outcome',
						value: 'appointmentOutcomes',
					},
					{
						name: 'Appointment Type',
						value: 'appointmentTypes',
					},
					{
						name: 'Automation',
						value: 'automations',
					},
					{
						name: 'Automation Assignment',
						value: 'automationsPeople',
					},
					{
						name: 'Call',
						value: 'calls',
					},
					{
						name: 'Custom Field',
						value: 'customFields',
					},
					{
						name: 'Deal',
						value: 'deals',
					},
					{
						name: 'Deal Attachment',
						value: 'dealAttachments',
					},
					{
						name: 'Deal Custom Field',
						value: 'dealCustomFields',
					},
					{
						name: 'Deal Pipeline',
						value: 'pipelines',
					},
					{
						name: 'Email Marketing Campaign',
						value: 'emailMarketingCampaigns',
					},
					{
						name: 'Email Marketing Event',
						value: 'emailMarketingEvents',
					},
					{
						name: 'Email Template',
						value: 'emailTemplates',
					},
					{
						name: 'Event',
						value: 'events',
					},
					{
						name: 'Group',
						value: 'groups',
					},
					{
						name: 'Identity',
						value: 'identity',
					},
					{
						name: 'Note',
						value: 'notes',
					},
					{
						name: 'People Relationship',
						value: 'peopleRelationships',
					},
					{
						name: 'Person',
						value: 'people',
					},
					{
						name: 'Person Attachment',
						value: 'personAttachments',
					},
					{
						name: 'Pond',
						value: 'ponds',
					},
					{
						name: 'Reaction',
						value: 'reactions',
					},
					{
						name: 'Smart List',
						value: 'smartLists',
					},
					{
						name: 'Stage',
						value: 'stages',
					},
					{
						name: 'Task',
						value: 'tasks',
					},
					{
						name: 'Team',
						value: 'teams',
					},
					{
						name: 'Team Inbox',
						value: 'teamInboxes',
					},
					{
						name: 'Text Message',
						value: 'textMessages',
					},
					{
						name: 'Text Message Template',
						value: 'textMessageTemplates',
					},
					{
						name: 'Threaded Reply',
						value: 'threadedReplies',
					},
					{
						name: 'Timeframe',
						value: 'timeframes',
					},
					{
						name: 'User',
						value: 'users',
					},
				],
				default: 'people',
			},
			...actionPlans.description,
			...actionPlansPeople.description,
			...appointmentOutcomes.description,
			...appointments.description,
			...appointmentTypes.description,
			...automations.description,
			...automationsPeople.description,
			...calls.description,
			...customFields.description,
			...dealAttachments.description,
			...dealCustomFields.description,
			...deals.description,
			...emailMarketingCampaigns.description,
			...emailMarketingEvents.description,
			...emailTemplates.description,
			...events.description,
			...groups.description,
			...identity.description,
			...notes.description,
			...people.description,
			...peopleRelationships.description,
			...personAttachments.description,
			...pipelines.description,
			...ponds.description,
			...reactions.description,
			...smartLists.description,
			...stages.description,
			...tasks.description,
			...teamInboxes.description,
			...teams.description,
			...textMessageTemplates.description,
			...textMessages.description,
			...threadedReplies.description,
			...timeframes.description,
			...users.description,
		],
	};

	methods = {
		loadOptions: methods.loadOptions,
		listSearch: methods.listSearch,
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await router.call(this);
	}
}
