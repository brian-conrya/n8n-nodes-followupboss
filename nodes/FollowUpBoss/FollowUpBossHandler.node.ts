import {
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionTypes,
    IDataObject,
} from 'n8n-workflow';
import { apiRequestAllItems } from './transport';
import { getTagsProperty, normalizeTags } from './helpers/utils';
import { WEBHOOK_EVENT_OPTIONS } from './constants';
import * as methods from './methods';

export class FollowUpBossHandler implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Follow Up Boss Handler',
        name: 'followUpBossHandler',
        icon: 'file:FollowUpBoss.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Hydrates and filters Follow Up Boss webhook events',
        documentationUrl: 'https://github.com/brian-conrya/n8n-nodes-followupboss/blob/main/nodes/FollowUpBoss/FollowUpBossHandler.md',
        defaults: {
            name: 'Follow Up Boss Handler',
        },
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
        credentials: [{ name: 'followUpBossApi', required: true }],
        properties: [
            {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                options: [
                    { name: 'Filter: Reference Type (Reactions/Replies)', value: 'refTypeEvents' },
                    { name: 'Filter: Stage Updated', value: 'peopleStageUpdated' },
                    { name: 'Filter: Tags Created', value: 'peopleTagsCreated' },
                    { name: 'Filter: Webhook Event', value: 'webhookEvent' },
                    { name: 'Hydrate (Get Full Data)', value: 'hydrate' },
                ],
                default: 'hydrate',
                description: 'Select the operation mode. All modes fetch full data from the API.',
            },

            // Filter: Webhook Event
            {
                displayName: 'Filter by Webhook Event',
                name: 'webhookEventFilter',
                type: 'multiOptions',
                default: [],
                options: WEBHOOK_EVENT_OPTIONS,
                description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                displayOptions: { show: { operation: ['webhookEvent'] } },
            },

            // Filter: Tags Created
            ...getTagsProperty('Filter by Tags').map(prop => ({
                ...prop,
                displayOptions: {
                    show: {
                        ...prop.displayOptions?.show,
                        operation: ['peopleTagsCreated'],
                    },
                },
            })),

            // Filter: Stage Updated
            {
                displayName: 'Filter by Stage',
                name: 'stageFilter',
                type: 'multiOptions',
                default: [],
                typeOptions: {
                    loadOptionsMethod: 'getStageNames',
                },
                description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                displayOptions: { show: { operation: ['peopleStageUpdated'] } },
            },

            // Filter: RefType
            {
                displayName: 'Filter by Reference Type',
                name: 'refTypeFilter',
                type: 'multiOptions',
                default: [],
                options: [
                    { name: 'Note', value: 'Note' },
                ],
                description: 'Select the reference types to trigger on. All other types will be dropped.',
                displayOptions: { show: { operation: ['refTypeEvents'] } },
            },
        ],
        usableAsTool: true,
    };

    methods = {
        loadOptions: methods.loadOptions,
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const operation = this.getNodeParameter('operation', 0) as string;

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const json = item.json;
            const data = (json.data as IDataObject) || {};
            const uri = (json.uri as string) || (data?.uri as string);
            const event = json.event as string;

            // Pre-Hydration Filtering (Signals)
            // Checks the lightweight webhook payload before incurring API costs

            if (operation === 'webhookEvent') {
                const webhookEventFilter = this.getNodeParameter('webhookEventFilter', i, []) as string[];

                if (webhookEventFilter.length > 0) {
                    if (!event || !webhookEventFilter.includes(event)) {
                        continue;
                    }
                }
            }

            if (operation === 'peopleTagsCreated') {
                const tagsMode = this.getNodeParameter('tagsMode', i, 'manual') as string;
                const tags = (data?.tags as string[]) || [];

                let filterTags: string[] = [];
                if (tagsMode === 'manual') {
                    const tagsManual = this.getNodeParameter('tagsManual', i, '') as string;
                    filterTags = normalizeTags(tagsMode, tagsManual, undefined);
                } else {
                    const tagsJson = this.getNodeParameter('tagsJson', i, undefined);
                    filterTags = normalizeTags(tagsMode, undefined, tagsJson);
                }

                if (filterTags.length > 0) {
                    const hasMatchingTag = tags && tags.some(tag => filterTags.includes(tag));
                    if (!hasMatchingTag) continue;
                }
            }

            if (operation === 'peopleStageUpdated') {
                const stageFilter = this.getNodeParameter('stageFilter', i, []) as string[];
                const stage = data?.stage as string;

                if (stageFilter.length > 0) {
                    if (!stage || !stageFilter.includes(stage)) {
                        continue;
                    }
                }
            }

            if (operation === 'refTypeEvents') {
                const refTypeFilter = this.getNodeParameter('refTypeFilter', i, []) as string[];
                const refType = data?.refType as string;

                if (refTypeFilter.length > 0) {
                    if (!refType || !refTypeFilter.includes(refType)) {
                        continue;
                    }
                }
            }

            // Hydration
            // Uses the passed URI to fetch the full resource state
            if (!uri) {
                continue;
            }

            try {
                const url = new URL(uri);
                const endpoint = url.pathname.replace(/^\/v1/, '');
                const results = await apiRequestAllItems.call(this, endpoint, {});

                results.forEach(result => returnData.push({ json: result }));

            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: (error as Error).message } });
                } else {
                    throw error;
                }
            }
        }

        return [returnData];
    }
}
