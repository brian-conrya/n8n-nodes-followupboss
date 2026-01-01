import { INodeProperties } from 'n8n-workflow';

import * as addCollaborators from './addCollaborators.operation';
import * as addTags from './addTags.operation';
import * as changeStage from './changeStage.operation';
import * as checkDuplicate from './checkDuplicate.operation';
import * as claim from './claim.operation';
import * as create from './create.operation';
import * as deleteOperation from './delete.operation';
import * as get from './get.operation';
import * as getAll from './getAll.operation';
import * as ignoreUnclaimed from './ignoreUnclaimed.operation';
import * as pauseActionPlans from './pauseActionPlans.operation';
import * as pauseAutomations from './pauseAutomations.operation';
import * as reassign from './reassign.operation';
import * as removeCollaborators from './removeCollaborators.operation';
import * as removeTags from './removeTags.operation';
import * as runActionPlan from './runActionPlan.operation';
import * as runAutomation from './runAutomation.operation';
import * as unclaimed from './unclaimed.operation';
import * as update from './update.operation';

export {
	addCollaborators,
	addTags,
	changeStage,
	checkDuplicate,
	claim,
	create,
	deleteOperation as delete,
	get,
	getAll,
	ignoreUnclaimed,
	pauseActionPlans,
	pauseAutomations,
	reassign,
	removeCollaborators,
	removeTags,
	runActionPlan,
	runAutomation,
	unclaimed,
	update,
};

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['people'],
			},
		},
		options: [
			{
				name: 'Add Collaborators',
				value: 'addCollaborators',
				description: 'Add one or more collaborators to a person',
				action: 'Add collaborators',
			},
			{
				name: 'Add Tags',
				value: 'addTags',
				description: 'Add one or more tags to a person',
				action: 'Add tags',
			},
			{
				name: 'Change Stage',
				value: 'changeStage',
				description: 'Change the stage handling a person',
				action: 'Change stage',
			},
			{
				name: 'Check Duplicate',
				value: 'checkDuplicate',
				description: 'Check if a person record is a duplicate',
				action: 'Check duplicate',
			},
			{
				name: 'Claim',
				value: 'claim',
				description: 'Claim an unassigned person',
				action: 'Claim a person',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new person record',
				action: 'Create a person',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Permanently delete a person',
				action: 'Delete a person',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Retrieve a person by ID',
				action: 'Get a person',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Retrieve a list of people',
				action: 'Get many people',
			},
			{
				name: 'Ignore Unclaimed',
				value: 'ignoreUnclaimed',
				description: 'Ignore an unclaimed person lead',
				action: 'Ignore unclaimed',
			},
			{
				name: 'Pause Action Plans',
				value: 'pauseActionPlans',
				description: 'Pause all action plans for a person',
				action: 'Pause action plans',
			},
			{
				name: 'Pause Automations',
				value: 'pauseAutomations',
				description: 'Pause all automations for a person',
				action: 'Pause automations',
			},
			{
				name: 'Reassign',
				value: 'reassign',
				description: 'Assign a person to a different user',
				action: 'Reassign a person',
			},
			{
				name: 'Remove Collaborators',
				value: 'removeCollaborators',
				description: 'Remove collaborators from a person',
				action: 'Remove collaborators',
			},
			{
				name: 'Remove Tags',
				value: 'removeTags',
				description: 'Remove one or more tags from a person',
				action: 'Remove tags',
			},
			{
				name: 'Run Action Plan',
				value: 'runActionPlan',
				description: 'Start an action plan for a person',
				action: 'Run action plan',
			},
			{
				name: 'Run Automation',
				value: 'runAutomation',
				description: 'Trigger an automation for a person',
				action: 'Run automation',
			},
			{
				name: 'Unclaimed',
				value: 'unclaimed',
				description: 'Retrieve a list of unclaimed people',
				action: 'Get unclaimed people',
			},
			{
				name: 'Update',
				value: 'update',
				description: "Update a person's details",
				action: 'Update a person',
			},
		],
		default: 'create',
	},
	...addCollaborators.description,
	...addTags.description,
	...changeStage.description,
	...checkDuplicate.description,
	...claim.description,
	...create.description,
	...deleteOperation.description,
	...get.description,
	...getAll.description,
	...ignoreUnclaimed.description,
	...pauseActionPlans.description,
	...pauseAutomations.description,
	...reassign.description,
	...removeCollaborators.description,
	...removeTags.description,
	...runActionPlan.description,
	...runAutomation.description,
	...unclaimed.description,
	...update.description,
];
