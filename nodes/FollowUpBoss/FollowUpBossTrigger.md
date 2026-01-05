# Follow Up Boss Trigger Node

The Follow Up Boss Trigger node listens for webhook events from [Follow Up Boss](https://www.followupboss.com/) and outputs the raw payload.

## Use Case

This node is designed as the entry point for webhook-based workflows. It registers a webhook with Follow Up Boss and outputs the lightweight payload whenever an event occurs.

**Typical Flow**:

```
Trigger → Handler → [Other Nodes]
  ↓         ↓
 Raw    Hydrated
Payload  + Filtered
```

Use the **[Follow Up Boss Handler](FollowUpBossHandler.md)** downstream to fetch full data and filter events.

## Configuration

### Webhook Event

Select which webhook event type to listen for. Each webhook can monitor one event type.

**Available Events**:

- **Appointments**: Created, Deleted, Updated
- **Calls**: Created, Deleted, Updated
- **Custom Fields**: Created, Deleted, Updated
- **Deals**: Created, Deleted, Updated
- **Deal Custom Fields**: Created, Deleted, Updated
- **Emails**: Created, Deleted, Updated
- **Email Events**: Clicked, Opened, Unsubscribed
- **Events**: Created
- **Notes**: Created, Deleted, Updated
- **People**: Created, Deleted, Updated
- **People Relationships**: Created, Deleted, Updated
- **People Stage**: Updated
- **People Tags**: Created
- **Pipelines**: Created, Deleted, Updated
- **Pipeline Stages**: Created, Deleted, Updated
- **Reactions**: Created, Deleted
- **Stages**: Created, Deleted, Updated
- **Tasks**: Created, Deleted, Updated
- **Text Messages**: Created, Deleted, Updated
- **Threaded Replies**: Created, Deleted, Updated

## Webhook Limits

**Important**: Follow Up Boss limits you to **2 webhooks per event type, per account, per system**, but the Trigger reserves one slot for testing mode, effectively allowing **only 1 active production workflow per event type**.

If you need multiple workflows listening to the same event:

1. Create a single "Dispatcher" workflow with the Trigger
2. Use the **Execute Workflow** node to call other workflows
3. Pass the webhook data to multiple workflows from one trigger

**Why only 1 production workflow?**  
The trigger automatically manages webhooks for both production and test modes. When you test a workflow, it creates a separate test webhook, so the 2-webhook limit means only 1 production workflow can be active at a time.

## Output

The trigger outputs the raw webhook payload with the following structure:

```json
{
	"event": "peopleCreated",
	"uri": "https://api.followupboss.com/v1/people/123456",
	"data": {
		// Lightweight event-specific data
		"id": 123456,
		"tags": ["Hot Lead"],
		"stage": "New Lead"
		// ... other fields depending on event type
	}
}
```

**Key Fields**:

- `event` - The webhook event type (e.g., `peopleCreated`, `appointmentsUpdated`)
- `uri` - API endpoint to fetch the full resource
- `data` - Lightweight event data (varies by event type)

## Workflow Pattern

### Basic Pattern

```
Trigger (People Created)
  → Handler (Hydrate)
    → [Process full person data]
```

### With Filtering

```
Trigger (People Tags Created)
  → Handler (Filter: Tags → "Hot Lead")
    → Send Notification
```

### Advanced Pattern

```
Trigger (People Updated)
  → Handler (Filter: Webhook Event → peopleUpdated)
    → Switch (on person.source)
      → Case "Website" → Workflow A
      → Case "Referral" → Workflow B
```

## Security

The trigger automatically verifies webhook signatures using your Follow Up Boss system key to ensure authenticity.

## Credentials

This node supports both API Key and OAuth2 authentication.

- [API Key Credentials](../../credentials/FollowUpBossApi.credentials.md)
- [OAuth2 Credentials](../../credentials/FollowUpBossOAuth2Api.credentials.md)

## Related Nodes

- **[Follow Up Boss Handler](FollowUpBossHandler.md)** - Hydrates and filters webhook events (use downstream)
- **[Follow Up Boss](FollowUpBoss.md)** - Main node for API operations
