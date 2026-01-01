import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class FollowUpBossApi implements ICredentialType {
	name = 'followUpBossApi';

	displayName = 'Follow Up Boss API';

	documentationUrl =
		'https://github.com/brian-conrya/n8n-nodes-followupboss/blob/main/credentials/FollowUpBossApi.credentials.md';

	icon = 'file:FollowUpBoss.svg' as const;

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description: 'The API key from Follow Up Boss.',
		},
		{
			displayName: 'System Name (X-System)',
			name: 'systemName',
			type: 'string',
			required: true,
			default: '',
			description:
				'The name of the registered system (e.g. "MyN8nIntegration"). Required for webhooks.',
		},
		{
			displayName: 'System Key (X-System-Key)',
			name: 'systemKey',
			type: 'string',
			typeOptions: { password: true },
			required: true,
			default: '',
			description:
				'The secret key identifying the system. Required for webhook signature verification and higher rate limits.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			auth: {
				username: '={{$credentials.apiKey}}',
				password: '',
			},
			headers: {
				'X-System': '={{$credentials.systemName}}',
				'X-System-Key': '={{$credentials.systemKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.followupboss.com/v1',
			url: '/identity',
		},
	};
}
