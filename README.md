# n8n-nodes-followupboss

This is an n8n community node. It lets you use [Follow Up Boss](https://www.followupboss.com/) in your n8n workflows.

Follow Up Boss is a leading CRM for high-growth real estate teams, helping you manage leads and close more deals.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)  
[Nodes](#nodes)  
[Credentials](#credentials)  
[Resources](#resources)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Nodes

This package provides three nodes for working with Follow Up Boss:

### Follow Up Boss

The main node for API operations - create, read, update, and delete resources.

**[Full Documentation](nodes/FollowUpBoss/FollowUpBoss.md)**

Supported resources include:

- People, Deals, Tasks, Notes
- Calls, Appointments, Events
- Action Plans, Automations
- Custom Fields, Stages, Pipelines
- And more...

### Follow Up Boss Trigger

Listens for webhook events from Follow Up Boss and outputs raw payload data.

**[Full Documentation](nodes/FollowUpBoss/FollowUpBossTrigger.md)**

Use as the entry point for webhook-based workflows. Supports all Follow Up Boss webhook event types.

### Follow Up Boss Handler

Processes webhook events with data hydration and pre-hydration filtering.

**[Full Documentation](nodes/FollowUpBoss/FollowUpBossHandler.md)**

Place downstream from the Trigger to:

- Fetch full resource data from the API
- Filter events before hydration to save API calls
- Support filtering by webhook event type, tags, stages, and more

## Credentials

You need a Follow Up Boss API Key to facilitate the connection.

See [Credential Documentation](credentials/FollowUpBossApi.credentials.md) for setup instructions.

## Resources

- [Follow Up Boss API Documentation](https://docs.followupboss.com/)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)

## License

[MIT](LICENSE)
