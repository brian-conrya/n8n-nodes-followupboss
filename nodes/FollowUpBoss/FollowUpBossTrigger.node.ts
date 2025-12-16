import {
    type ILoadOptionsFunctions,
    type INodePropertyOptions,
    type IHookFunctions,
    type IWebhookFunctions,
    type INodeType,
    type INodeTypeDescription,
    type IWebhookResponseData,
    type IDataObject,
    NodeConnectionTypes,
    NodeOperationError,
} from 'n8n-workflow';
import { createHmac, createHash, timingSafeEqual } from 'crypto';
import { apiRequest } from './transport';
import { wrapData } from './helpers/utils';

const EVENT_TRIGGER_MAP: { [key: string]: string } = {
    'Appointments Created': 'appointmentsCreated',
    'Appointments Deleted': 'appointmentsDeleted',
    'Appointments Updated': 'appointmentsUpdated',
    'Calls Created': 'callsCreated',
    'Calls Deleted': 'callsDeleted',
    'Calls Updated': 'callsUpdated',
    'Custom Fields Created': 'customFieldsCreated',
    'Custom Fields Deleted': 'customFieldsDeleted',
    'Custom Fields Updated': 'customFieldsUpdated',
    'Deal Custom Fields Created': 'dealCustomFieldsCreated',
    'Deal Custom Fields Deleted': 'dealCustomFieldsDeleted',
    'Deal Custom Fields Updated': 'dealCustomFieldsUpdated',
    'Deals Created': 'dealsCreated',
    'Deals Deleted': 'dealsDeleted',
    'Deals Updated': 'dealsUpdated',
    'Email Events Clicked': 'emEventsClicked',
    'Email Events Opened': 'emEventsOpened',
    'Email Events Unsubscribed': 'emEventsUnsubscribed',
    'Emails Created': 'emailsCreated',
    'Emails Deleted': 'emailsDeleted',
    'Emails Updated': 'emailsUpdated',
    'Events Created': 'eventsCreated',
    'Notes Created': 'notesCreated',
    'Notes Deleted': 'notesDeleted',
    'Notes Updated': 'notesUpdated',
    'People Created': 'peopleCreated',
    'People Deleted': 'peopleDeleted',
    'People Relationship Created': 'peopleRelationshipCreated',
    'People Relationship Deleted': 'peopleRelationshipDeleted',
    'People Relationship Updated': 'peopleRelationshipUpdated',
    'People Stage Updated': 'peopleStageUpdated',
    'People Tags Created': 'peopleTagsCreated',
    'People Updated': 'peopleUpdated',
    'Pipeline Created': 'pipelineCreated',
    'Pipeline Deleted': 'pipelineDeleted',
    'Pipeline Stage Created': 'pipelineStageCreated',
    'Pipeline Stage Deleted': 'pipelineStageDeleted',
    'Pipeline Stage Updated': 'pipelineStageUpdated',
    'Pipeline Updated': 'pipelineUpdated',
    'Reaction Created': 'reactionCreated',
    'Reaction Deleted': 'reactionDeleted',
    'Stage Created': 'stageCreated',
    'Stage Deleted': 'stageDeleted',
    'Stage Updated': 'stageUpdated',
    'Tasks Created': 'tasksCreated',
    'Tasks Deleted': 'tasksDeleted',
    'Tasks Updated': 'tasksUpdated',
    'Text Messages Created': 'textMessagesCreated',
    'Text Messages Deleted': 'textMessagesDeleted',
    'Text Messages Updated': 'textMessagesUpdated',
    'Threaded Reply Created': 'threadedReplyCreated',
    'Threaded Reply Deleted': 'threadedReplyDeleted',
    'Threaded Reply Updated': 'threadedReplyUpdated',
};


// Helper function to generate a deterministic account hash based on credentials
function generateAccountHash(apiKey: string, systemName: string, systemKey: string): string {
    const hash = createHash('sha256')
        .update(apiKey + systemName + systemKey)
        .digest('hex')
        .substring(0, 12);
    return hash;
}

export class FollowUpBossTrigger implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Follow Up Boss Trigger',
        name: 'followUpBossTrigger',
        icon: 'file:FollowUpBoss.svg',
        group: ['trigger'],
        version: 1,
        subtitle: '={{$parameter["event"]}}{{$parameter["tagFilter"]?.tags ? ": " + $parameter["tagFilter"].tags.map(t=>t.name).join(", ") : ""}}{{$parameter["stageFilter"]?.length ? ": " + $parameter["stageFilter"].join(", ") : ""}}{{$parameter["refTypeFilter"]?.length ? ": " + $parameter["refTypeFilter"].join(", ") : ""}}',
        description: 'Handle Follow Up Boss events via webhooks',
        documentationUrl: 'https://github.com/brian-conrya/n8n-nodes-followupboss/blob/main/README.md',
        defaults: {
            name: 'Follow Up Boss Trigger',
        },
        inputs: [],
        outputs: [NodeConnectionTypes.Main],
        credentials: [{ name: 'followUpBossApi', required: true }],
        webhooks: [
            {
                name: 'default',
                httpMethod: 'POST',
                responseMode: 'onReceived',
                path: 'followupboss',
                // Note: The actual path is dynamically generated in webhookMethods
                // based on credentials to support multiple FUB accounts
            },
        ],
        properties: [
            {
                displayName: 'Event',
                name: 'event',
                type: 'options',
                options: [
                    { name: 'Appointments Created', value: 'Appointments Created' },
                    { name: 'Appointments Deleted', value: 'Appointments Deleted' },
                    { name: 'Appointments Updated', value: 'Appointments Updated' },
                    { name: 'Calls Created', value: 'Calls Created' },
                    { name: 'Calls Deleted', value: 'Calls Deleted' },
                    { name: 'Calls Updated', value: 'Calls Updated' },
                    { name: 'Custom Fields Created', value: 'Custom Fields Created' },
                    { name: 'Custom Fields Deleted', value: 'Custom Fields Deleted' },
                    { name: 'Custom Fields Updated', value: 'Custom Fields Updated' },
                    { name: 'Deal Custom Fields Created', value: 'Deal Custom Fields Created' },
                    { name: 'Deal Custom Fields Deleted', value: 'Deal Custom Fields Deleted' },
                    { name: 'Deal Custom Fields Updated', value: 'Deal Custom Fields Updated' },
                    { name: 'Deals Created', value: 'Deals Created' },
                    { name: 'Deals Deleted', value: 'Deals Deleted' },
                    { name: 'Deals Updated', value: 'Deals Updated' },
                    { name: 'Email Events Clicked', value: 'Email Events Clicked' },
                    { name: 'Email Events Opened', value: 'Email Events Opened' },
                    { name: 'Email Events Unsubscribed', value: 'Email Events Unsubscribed' },
                    { name: 'Emails Created', value: 'Emails Created' },
                    { name: 'Emails Deleted', value: 'Emails Deleted' },
                    { name: 'Emails Updated', value: 'Emails Updated' },
                    { name: 'Events Created', value: 'Events Created' },
                    { name: 'Notes Created', value: 'Notes Created' },
                    { name: 'Notes Deleted', value: 'Notes Deleted' },
                    { name: 'Notes Updated', value: 'Notes Updated' },
                    { name: 'People Created', value: 'People Created' },
                    { name: 'People Deleted', value: 'People Deleted' },
                    { name: 'People Relationship Created', value: 'People Relationship Created' },
                    { name: 'People Relationship Deleted', value: 'People Relationship Deleted' },
                    { name: 'People Relationship Updated', value: 'People Relationship Updated' },
                    { name: 'People Stage Updated', value: 'People Stage Updated' },
                    { name: 'People Tags Created', value: 'People Tags Created' },
                    { name: 'People Updated', value: 'People Updated' },
                    { name: 'Pipeline Created', value: 'Pipeline Created' },
                    { name: 'Pipeline Deleted', value: 'Pipeline Deleted' },
                    { name: 'Pipeline Stage Created', value: 'Pipeline Stage Created' },
                    { name: 'Pipeline Stage Deleted', value: 'Pipeline Stage Deleted' },
                    { name: 'Pipeline Stage Updated', value: 'Pipeline Stage Updated' },
                    { name: 'Pipeline Updated', value: 'Pipeline Updated' },
                    { name: 'Reaction Created', value: 'Reaction Created' },
                    { name: 'Reaction Deleted', value: 'Reaction Deleted' },
                    { name: 'Stage Created', value: 'Stage Created' },
                    { name: 'Stage Deleted', value: 'Stage Deleted' },
                    { name: 'Stage Updated', value: 'Stage Updated' },
                    { name: 'Tasks Created', value: 'Tasks Created' },
                    { name: 'Tasks Deleted', value: 'Tasks Deleted' },
                    { name: 'Tasks Updated', value: 'Tasks Updated' },
                    { name: 'Text Messages Created', value: 'Text Messages Created' },
                    { name: 'Text Messages Deleted', value: 'Text Messages Deleted' },
                    { name: 'Text Messages Updated', value: 'Text Messages Updated' },
                    { name: 'Threaded Reply Created', value: 'Threaded Reply Created' },
                    { name: 'Threaded Reply Deleted', value: 'Threaded Reply Deleted' },
                    { name: 'Threaded Reply Updated', value: 'Threaded Reply Updated' },
                ],
                default: 'People Created',
                required: true,
                description: 'The event to listen for',
            },
            {
                displayName: 'Tag Filter',
                name: 'tagFilter',
                type: 'fixedCollection',
                default: {},
                typeOptions: {
                    multipleValues: true,
                },
                displayOptions: {
                    show: {
                        event: ['People Tags Created'],
                    },
                },
                description: 'If set, the workflow will only trigger when at least oneof these specific tags is added',
                options: [
                    {
                        name: 'tags',
                        displayName: 'Tags',
                        values: [
                            {
                                displayName: 'Tag',
                                name: 'name',
                                type: 'string',
                                default: '',
                            },
                        ],
                    },
                ],
            },
            {
                displayName: 'Stage Names or IDs',
                name: 'stageFilter',
                type: 'multiOptions',
                default: [],
                typeOptions: {
                    loadOptionsMethod: 'getStages',
                },
                displayOptions: {
                    show: {
                        event: ['People Stage Updated'],
                    },
                },
                description: 'Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
            },
            {
                displayName: 'Ref Type Filter',
                name: 'refTypeFilter',
                type: 'multiOptions',
                default: [],
                options: [
                    { name: 'Note', value: 'Note' },
                ],
                displayOptions: {
                    show: {
                        event: ['Reaction Created', 'Reaction Deleted', 'Threaded Reply Created', 'Threaded Reply Deleted', 'Threaded Reply Updated'],
                    },
                },
                description: 'If set, the workflow will only trigger when the reference type matches one of these values',
            },
            {
                displayName: 'Output',
                name: 'output',
                type: 'options',
                options: [
                    {
                        name: 'Event Data',
                        value: 'eventData',
                        description: 'Returns the enriched resource data (e.g. the Person object) if available, otherwise returns the raw event payload (e.g. for Deleted events).',
                    },
                    {
                        name: 'Event',
                        value: 'event',
                        description: 'Returns the raw webhook event payload',
                    },
                ],
                default: 'eventData',
                description: 'Choose whether to return the enriched event data or the raw event payload. Note: Delete events will always return the raw event payload as the resource no longer exists.',
            },
            {
                displayName: 'Recreate Webhooks',
                name: 'recreateWebhooks',
                type: 'boolean',
                default: false,
                description: "Whether to delete and recreate existing webhooks for the selected events. Use this to fix the case where you can't create a new event because zombie webhooks are already registered.",
            },
        ],
        usableAsTool: true,
    };

    webhookMethods = {
        default: {
            async checkExists(this: IHookFunctions): Promise<boolean> {
                // Generate account hash from credentials
                const credentials = await this.getCredentials('followUpBossApi');
                const accountHash = generateAccountHash(
                    credentials.apiKey as string,
                    credentials.systemName as string,
                    credentials.systemKey as string
                );

                // Get webhook URL with account query parameter
                const baseUrl = this.getNodeWebhookUrl('default');
                if (!baseUrl) {
                    throw new NodeOperationError(this.getNode(), 'Could not generate webhook URL');
                }
                const webhookUrl = `${baseUrl}?account=${accountHash}`;
                const eventDisplayName = this.getNodeParameter('event') as string;
                const event = EVENT_TRIGGER_MAP[eventDisplayName];

                try {
                    const existingWebhooksResponse = await apiRequest.call(this, 'GET', '/webhooks');
                    const existingWebhooks = (existingWebhooksResponse.webhooks || []) as Array<{ id: number; event: string; url: string }>;

                    // Check if the event has a corresponding webhook with the same URL
                    return existingWebhooks.some(w => w.event === event && w.url === webhookUrl);
                } catch {
                    // If we can't check, assume it doesn't exist so we try to create it (and maybe fail then)
                    return false;
                }
            },
            async create(this: IHookFunctions): Promise<boolean> {
                // Generate account hash from credentials
                const credentials = await this.getCredentials('followUpBossApi');
                const accountHash = generateAccountHash(
                    credentials.apiKey as string,
                    credentials.systemName as string,
                    credentials.systemKey as string
                );

                // Get webhook URL with account query parameter
                const baseUrl = this.getNodeWebhookUrl('default');
                if (!baseUrl) {
                    throw new NodeOperationError(this.getNode(), 'Could not generate webhook URL');
                }
                const webhookUrl = `${baseUrl}?account=${accountHash}`;
                const eventDisplayName = this.getNodeParameter('event') as string;
                const event = EVENT_TRIGGER_MAP[eventDisplayName];

                // Fetch all existing webhooks to check for duplicates
                const existingWebhooksResponse = await apiRequest.call(this, 'GET', '/webhooks');
                const existingWebhooks = (existingWebhooksResponse.webhooks || []) as Array<{ id: number; event: string; url: string }>;

                // Check if this specific event webhook already exists with the same URL
                const existingWebhook = existingWebhooks.find(w => w.event === event && w.url === webhookUrl);

                if (existingWebhook) {
                    // If it exists, just use it
                    const webhookData = this.getWorkflowStaticData('node');
                    webhookData.webhookId = existingWebhook.id;
                    return true;
                }

                // Check if we hit the limit (2 per event)
                const eventWebhooks = existingWebhooks.filter((w) => w.event === event);

                if (eventWebhooks.length >= 2) {
                    const recreateWebhooks = this.getNodeParameter('recreateWebhooks', false) as boolean;

                    if (recreateWebhooks) {
                        // Find the oldest webhook (lowest ID) and delete it
                        // Sort by ID ascending
                        eventWebhooks.sort((a, b) => a.id - b.id);
                        const oldestWebhook = eventWebhooks[0];

                        try {
                            await apiRequest.call(this, 'DELETE', `/webhooks/${oldestWebhook.id}`);
                        } catch {
                            // Ignore delete errors, maybe it's already gone
                        }
                    } else {
                        throw new NodeOperationError(this.getNode(), `Webhook limit reached for event '${event}' and system '${credentials.systemName}'. Follow Up Boss allows a maximum of 2 webhooks per event per system. Please delete unused webhooks in your Follow Up Boss account.`);
                    }
                }

                const body = {
                    event,
                    url: webhookUrl,
                };

                const response = await apiRequest.call(this, 'POST', '/webhooks', body);

                const webhookData = this.getWorkflowStaticData('node');
                webhookData.webhookId = response.id as number;

                return true;
            },
            async delete(this: IHookFunctions): Promise<boolean> {
                // Generate account hash from credentials
                const credentials = await this.getCredentials('followUpBossApi');
                const accountHash = generateAccountHash(
                    credentials.apiKey as string,
                    credentials.systemName as string,
                    credentials.systemKey as string
                );

                // Get webhook URL with account query parameter
                const baseUrl = this.getNodeWebhookUrl('default');
                if (!baseUrl) {
                    throw new NodeOperationError(this.getNode(), 'Could not generate webhook URL');
                }
                const webhookUrl = `${baseUrl}?account=${accountHash}`;
                const webhookData = this.getWorkflowStaticData('node');
                const webhookId = webhookData.webhookId as number;

                // Check if this is a Test Webhook (Manual Execution)
                // n8n test webhooks usually contain 'webhook-test' in the URL
                if (webhookUrl && webhookUrl.includes('webhook-test')) {
                    if (webhookId) {
                        try {
                            await apiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);
                        } catch {
                            // Ignore errors if webhook is already deleted
                        }
                    }
                    delete webhookData.webhookId;
                    return true;
                }

                // Production Webhook: Soft Delete
                // Do NOT delete the webhook from FUB.
                // Just clear the local static data.
                delete webhookData.webhookId;
                return true;
            },
        },
    };

    methods = {
        loadOptions: {
            async getStages(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
                const responseData = await apiRequest.call(this, 'GET', '/stages');
                const stages = responseData.stages as IDataObject[];
                return stages.map((stage) => ({
                    name: stage.name as string,
                    value: stage.name as string,
                }));
            },
        },
    };

    async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
        const req = this.getRequestObject();

        // Normal webhook handling for production mode
        const credentials = await this.getCredentials('followUpBossApi');

        // Account Hash Filtering
        // Verify the webhook is intended for this specific account
        const accountParam = req.query?.account as string | undefined;
        const expectedHash = generateAccountHash(
            credentials.apiKey as string,
            credentials.systemName as string,
            credentials.systemKey as string
        );

        if (accountParam !== expectedHash) {
            // This webhook is for a different account, ignore it
            return { workflowData: [] };
        }

        // Signature Verification
        const systemKey = credentials.systemKey as string;

        const signatureHeader = req.headers['fub-signature'] as string;
        if (!signatureHeader) {
            if (systemKey) {
                throw new NodeOperationError(this.getNode(), 'Missing FUB-Signature header');
            }
        }

        if (systemKey && signatureHeader) {
            let payloadToSign: string;

            if (req.rawBody) {
                payloadToSign = req.rawBody.toString();
            } else {
                payloadToSign = JSON.stringify(req.body);
            }

            const encodedPayload = Buffer.from(payloadToSign).toString('base64');
            const calculatedSignature = createHmac('sha256', systemKey)
                .update(encodedPayload)
                .digest('hex');

            const isValid = timingSafeEqual(
                Buffer.from(calculatedSignature),
                Buffer.from(signatureHeader)
            );

            if (!isValid) {
                throw new NodeOperationError(this.getNode(), 'Invalid FUB-Signature - webhook verification failed');
            }
        }

        const body = req.body as IDataObject;
        const eventType = body.event as string;
        const eventDisplayName = this.getNodeParameter('event') as string;
        const event = EVENT_TRIGGER_MAP[eventDisplayName];

        // Event Matching
        if (event !== eventType) {
            return { workflowData: [] };
        }

        // Tag Filtering
        if (eventType === 'peopleTagsCreated') {
            const tagFilter = this.getNodeParameter('tagFilter', {}) as IDataObject;
            if (tagFilter.tags) {
                const data = body.data as IDataObject;
                const tags = data.tags as string[];
                const filterTagsList = tagFilter.tags as IDataObject[];
                const filterTags = filterTagsList.map(t => t.name as string);

                // Check if any of the received tags match any of the filter tags
                const hasMatchingTag = tags && tags.some(tag => filterTags.includes(tag));

                if (!hasMatchingTag) {
                    return { workflowData: [] };
                }
            }
        }

        // Stage Filtering
        if (eventType === 'peopleStageUpdated') {
            const stageFilter = this.getNodeParameter('stageFilter', []) as string[];
            if (stageFilter.length > 0) {
                const data = body.data as IDataObject;
                const stage = data.stage as string;

                // Check if the received stage matches any of the filter stages
                if (!stageFilter.includes(stage)) {
                    return { workflowData: [] };
                }
            }
        }

        // RefType Filtering (for reactions and threaded replies)
        const refTypeEvents = ['reactionCreated', 'reactionDeleted', 'threadedReplyCreated', 'threadedReplyDeleted', 'threadedReplyUpdated'];
        if (refTypeEvents.includes(eventType)) {
            const refTypeFilter = this.getNodeParameter('refTypeFilter', []) as string[];
            if (refTypeFilter.length > 0) {
                const data = body.data as IDataObject;
                const refType = data?.refType as string | undefined;

                // Check if the received refType matches any of the filter refTypes
                if (!refType || !refTypeFilter.includes(refType)) {
                    return { workflowData: [] };
                }
            }
        }

        // Enrich webhook data by fetching actual resource data
        const uri = body.uri as string | null;
        const output = this.getNodeParameter('output', 'eventData') as string;

        if (output === 'event' || !uri) {
            return {
                workflowData: [wrapData(body)],
            };
        }

        // output === 'eventData' && uri exists
        // Extract the path from the URI (remove base URL and /v1 prefix)
        const url = new URL(uri);
        // Remove '/v1' prefix from pathname as apiRequest adds it
        const endpoint = url.pathname.replace(/^\/v1/, '');

        // Parse query string into object
        const qs: IDataObject = {};
        url.searchParams.forEach((value, key) => {
            qs[key] = value;
        });

        // Fetch the actual resource data
        const resourceData = await apiRequest.call(this, 'GET', endpoint, {}, qs);

        // Return the resource data
        return {
            workflowData: [wrapData(resourceData)],
        };
    }
}
