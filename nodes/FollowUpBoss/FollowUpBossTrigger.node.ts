import {
	type IHookFunctions,
	type IWebhookFunctions,
	type INodeType,
	type INodeTypeDescription,
	type IWebhookResponseData,
	type IDataObject,
	NodeConnectionTypes,
	NodeOperationError,
} from 'n8n-workflow';
import { createHmac, timingSafeEqual } from 'crypto';
import { apiRequest } from './transport';
import { wrapData } from './helpers/utils';
import { WEBHOOK_EVENT_MAP } from './constants';
import * as methods from './methods';

const MAX_WEBHOOKS_PER_EVENT = 2;

export class FollowUpBossTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Follow Up Boss Trigger',
		name: 'followUpBossTrigger',
		icon: 'file:FollowUpBoss.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Handle Follow Up Boss events via webhooks',
		documentationUrl:
			'https://github.com/brian-conrya/n8n-nodes-followupboss/blob/main/nodes/FollowUpBoss/FollowUpBossTrigger.md',
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
				path: 'followupboss-n8n',
				ndvHideUrl: true,
			},
		],
		properties: [
			{
				displayName:
					'Only 1 active workflow per event (the 2nd slot is reserved for testing). Activating a new workflow will disconnect any previous one for this event. Need more? Use an Execute Workflow node to fan out from a single trigger.',
				name: 'limitationNotice',
				type: 'notice',
				default: '',
			},
			{
				displayName: 'Webhook Event',
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
				description: 'The webhook event to listen for',
			},
		],
		usableAsTool: true,
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				if (!webhookUrl) return false;

				const eventDisplayName = this.getNodeParameter('event') as string;
				const event = WEBHOOK_EVENT_MAP[eventDisplayName];
				const currentMode = webhookUrl.includes('/webhook-test') ? 'test' : 'production';

				const webhookData = this.getWorkflowStaticData('node');

				// Detect Configuration Change (Event or URL change)
				if (
					webhookData.webhookId &&
					(webhookData.registeredEvent !== event || webhookData.registeredUrl !== webhookUrl)
				) {
					// Config changed, clean up the OLD webhook first
					try {
						await apiRequest.call(this, 'DELETE', `/webhooks/${webhookData.webhookId}`);
					} catch {
						// Ignore errors (webhook might already be gone)
					}
					delete webhookData.webhookId;
					delete webhookData.registeredEvent;
					delete webhookData.registeredUrl;
					return false;
				}

				try {
					// Fetch existing webhooks for this event
					const existingWebhooksResponse = await apiRequest.call(
						this,
						'GET',
						'/webhooks',
						{},
						{ event },
					);
					const existingWebhooks = (existingWebhooksResponse.webhooks || []) as Array<{
						id: number;
						event: string;
						url: string;
					}>;

					// Idempotency (Check if ALREADY registered with the current configuration)
					const matchedWebhook = existingWebhooks.find((w) => w.url === webhookUrl);
					if (matchedWebhook) {
						// Update static data just in case it was out of sync
						webhookData.webhookId = matchedWebhook.id;
						webhookData.registeredEvent = event;
						webhookData.registeredUrl = webhookUrl;
						return true;
					}

					// Like-for-Like Purge
					// Auto-Disconnect other workflows in the SAME mode (Prod kills Prod, Test kills Test).
					const n8nCandidates = existingWebhooks.filter((w) => w.url.includes('followupboss-n8n'));

					for (const w of n8nCandidates) {
						const candidateMode = w.url.includes('/webhook-test') ? 'test' : 'production';

						// Delete if: Same Mode (and not current URL)
						if (candidateMode === currentMode && w.url !== webhookUrl) {
							try {
								await apiRequest.call(this, 'DELETE', `/webhooks/${w.id}`);
							} catch {
								// Ignore delete errors
							}
						}
					}

					// Always return false to force 'create' execution (unless Idempotency matched earlier).
					return false;
				} catch {
					// If check fails, return false to attempt creation and let it fail there if needed.
					return false;
				}
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				if (!webhookUrl) return false;

				const eventDisplayName = this.getNodeParameter('event') as string;
				const event = WEBHOOK_EVENT_MAP[eventDisplayName];

				if (webhookUrl.includes('//localhost')) {
					throw new NodeOperationError(
						this.getNode(),
						'The Webhook cannot work on "localhost". Please, either setup n8n on a custom domain or start with "--tunnel"!',
					);
				}

				// Fetch current state (after checkExists cleanup)
				const existingWebhooksResponse = await apiRequest.call(
					this,
					'GET',
					'/webhooks',
					{},
					{ event },
				);
				const existingWebhooks = (existingWebhooksResponse.webhooks || []) as Array<{
					id: number;
					event: string;
					url: string;
				}>;

				// Idempotency: Last check if it exists
				const existingWebhook = existingWebhooks.find((w) => w.url === webhookUrl);
				const webhookData = this.getWorkflowStaticData('node');

				if (existingWebhook) {
					webhookData.webhookId = existingWebhook.id;
					webhookData.registeredEvent = event;
					webhookData.registeredUrl = webhookUrl;
					return true;
				}

				// Capacity Check: If limits are still full, it must be External/Zapier webhooks blocking us.
				if (existingWebhooks.length >= MAX_WEBHOOKS_PER_EVENT) {
					throw new NodeOperationError(
						this.getNode(),
						`Maximum webhook limit reached. We attempted to clean up old n8n webhooks, but the slots are still full. This usually means external integrations (like Zapier or other tools) are using all available slots. Please manually remove one via the Follow Up Boss API.`,
					);
				}

				// Create
				const body = {
					event,
					url: webhookUrl,
				};

				const response = await apiRequest.call(this, 'POST', '/webhooks', body);

				webhookData.webhookId = response.id as number;
				webhookData.registeredEvent = event;
				webhookData.registeredUrl = webhookUrl;

				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				const webhookId = webhookData.webhookId as number;

				if (webhookId) {
					try {
						await apiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);
					} catch {
						// Ignore errors if webhook is already deleted
					}
				}
				delete webhookData.webhookId;
				delete webhookData.registeredEvent;
				delete webhookData.registeredUrl;
				return true;
			},
		},
	};

	methods = {
		loadOptions: {
			getStages: methods.loadOptions.getStages,
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();

		// Normal webhook handling for production mode
		const credentials = await this.getCredentials('followUpBossApi');

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
				Buffer.from(signatureHeader),
			);

			if (!isValid) {
				throw new NodeOperationError(
					this.getNode(),
					'Invalid FUB-Signature - webhook verification failed',
				);
			}
		}

		const body = req.body as IDataObject;
		const eventType = body.event as string;
		const eventDisplayName = this.getNodeParameter('event') as string;
		const event = WEBHOOK_EVENT_MAP[eventDisplayName];

		// Event Matching
		if (event !== eventType) {
			return { workflowData: [] };
		}

		// Return the raw webhook payload
		return {
			workflowData: [wrapData(body)],
		};
	}
}
