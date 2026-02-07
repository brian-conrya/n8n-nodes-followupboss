import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';
import { wrapData } from '../helpers/utils';

import * as actionPlans from './actionPlans';
import * as actionPlansPeople from './actionPlansPeople';
import * as appointmentOutcomes from './appointmentOutcomes';
import * as appointments from './appointments';
import * as appointmentTypes from './appointmentTypes';
import * as automations from './automations';
import * as automationsPeople from './automationsPeople';
import * as calls from './calls';
import * as customFields from './customFields';
import * as dealAttachments from './dealAttachments';
import * as dealCustomFields from './dealCustomFields';
import * as deals from './deals';
import * as emailMarketingCampaigns from './emailMarketingCampaigns';
import * as emailMarketingEvents from './emailMarketingEvents';
import * as emailTemplates from './emailTemplates';
import * as events from './events';
import * as groups from './groups';
import * as identity from './identity';
import * as notes from './notes';
import * as people from './people';
import * as peopleRelationships from './peopleRelationships';
import * as personAttachments from './personAttachments';
import * as pipelines from './pipelines';
import * as ponds from './ponds';
import * as reactions from './reactions';
import * as smartLists from './smartLists';
import * as stages from './stages';
import * as tasks from './tasks';
import * as teamInboxes from './teamInboxes';
import * as teams from './teams';
import * as textMessages from './textMessages';
import * as textMessageTemplates from './textMessageTemplates';
import * as threadedReplies from './threadedReplies';
import * as timeframes from './timeframes';
import * as users from './users';

export const followUpBossNodeData = {
	actionPlans,
	actionPlansPeople,
	appointmentOutcomes,
	appointments,
	appointmentTypes,
	automations,
	automationsPeople,
	calls,
	customFields,
	dealAttachments,
	dealCustomFields,
	deals,
	emailMarketingCampaigns,
	emailMarketingEvents,
	emailTemplates,
	events,
	groups,
	identity,
	notes,
	people,
	peopleRelationships,
	personAttachments,
	pipelines,
	ponds,
	reactions,
	smartLists,
	stages,
	tasks,
	teamInboxes,
	teams,
	textMessages,
	textMessageTemplates,
	threadedReplies,
	timeframes,
	users,
};

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];
	const resource = this.getNodeParameter('resource', 0) as string;
	const operation = this.getNodeParameter('operation', 0) as string;

	const resourceData = followUpBossNodeData[
		resource as keyof typeof followUpBossNodeData
	] as unknown as {
		[key: string]: {
			execute: (this: IExecuteFunctions, i: number) => Promise<INodeExecutionData[]>;
		};
	};
	const operationData = resourceData[operation];

	if (!operationData) {
		throw new NodeOperationError(this.getNode(), `The operation "${operation}" is not known!`);
	}

	for (let i = 0; i < items.length; i++) {
		try {
			const response = await operationData.execute.call(this, i);
			returnData.push(...response);
		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push(...wrapData({ error: error.message }, i));
				continue;
			}
			throw error;
		}
	}

	return [returnData];
}
