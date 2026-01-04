import type {
    IAuthenticateGeneric,
    ICredentialTestRequest,
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class FollowUpBossOAuth2Api implements ICredentialType {
    name = 'followUpBossOAuth2Api';

    extends = ['oAuth2Api'];

    displayName = 'Follow Up Boss OAuth2 API';

    documentationUrl = 'https://github.com/brian-conrya/n8n-nodes-followupboss/blob/main/credentials/FollowUpBossOAuth2Api.credentials.md';

    icon = 'file:FollowUpBoss.svg' as const;

    properties: INodeProperties[] = [
        {
            displayName: 'Grant Type',
            name: 'grantType',
            type: 'hidden',
            default: 'authorizationCode',
        },
        {
            displayName: 'Authorization URL',
            name: 'authUrl',
            type: 'hidden',
            default: 'https://app.followupboss.com/oauth/authorize',
            required: true,
        },
        {
            displayName: 'Access Token URL',
            name: 'accessTokenUrl',
            type: 'hidden',
            default: 'https://app.followupboss.com/oauth/token',
            required: true,
        },
        {
            displayName: 'Scope',
            name: 'scope',
            type: 'hidden',
            default: '',
        },
        {
            displayName: 'Auth URI Query Parameters',
            name: 'authQueryParameters',
            type: 'hidden',
            default: 'prompt=login',
        },
        {
            displayName: 'Additional Body Properties',
            name: 'additionalBodyProperties',
            type: 'hidden',
            // Follow Up Boss requires a state parameter, but does not appear
            // to check it. We cannot dynamically get n8n's state so just use
            // a dummy value.
            default: '{"state": "dummy"}',
        },
        {
            displayName: 'Authentication',
            name: 'authentication',
            type: 'hidden',
            default: 'header',
        },
        {
            displayName: 'System Name (X-System)',
            name: 'systemName',
            type: 'string',
            required: true,
            default: '',
        },
        {
            displayName: 'System Key (X-System-Key)',
            name: 'systemKey',
            type: 'string',
            typeOptions: { password: true },
            required: true,
            default: '',
        },
    ];

    authenticate: IAuthenticateGeneric = {
        type: 'generic',
        properties: {
            headers: {
                Authorization: '=Bearer {{$credentials.oauthTokenData.access_token}}',
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
