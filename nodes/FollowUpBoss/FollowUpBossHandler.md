# Follow Up Boss Handler Node

The Follow Up Boss Handler node processes webhook events from the [Follow Up Boss Trigger](FollowUpBossTrigger.md), providing data hydration and pre-hydration filtering capabilities.

## Use Case

This node is designed to work downstream from the [Follow Up Boss Trigger](FollowUpBossTrigger.md):

```
Trigger → Handler → [Other Nodes]
  ↓         ↓
 Raw    Hydrated
Payload  + Filtered
```

The Trigger outputs lightweight webhook payloads, and the Handler fetches the full data from the Follow Up Boss API while optionally filtering events before making expensive API calls.

## Operations

### Hydrate (Get Full Data)
Fetches the complete resource data for any webhook event without filtering.

**Use when**: You want full data for all webhook events.

### Filter: Webhook Event
Pre-filters based on the webhook event type before hydration.

**Parameters**:
- **Filter by Webhook Event** - Select which webhook event types to process (e.g., `peopleCreated`, `appointmentsUpdated`, `notesCreated`)

**Use when**: You only care about specific event types and want to avoid unnecessary API calls for others.

### Filter: Tags Created
Pre-filters `People Tags Created` events based on which tags were added.

**Parameters**:
- **Tags Input Mode** - Choose between manual entry or JSON array
- **Filter by Tags (Manual)** - Enter tags one per line (when mode is "Manual")
- **Filter by Tags (JSON)** - Map a JSON array of tag names (when mode is "Map / JSON Array")

**Use when**: You want to trigger workflows only when specific tags are added to people (e.g., "Hot Lead", "VIP Client").

### Filter: Stage Updated
Pre-filters `People Stage Updated` events based on which stage people moved to.

**Parameters**:
- **Filter by Stage** - Select stage names from dropdown

**Use when**: You want workflows to run only when people enter specific pipeline stages (e.g., "Under Contract", "Closed").

### Filter: Reference Type (Reactions/Replies)
Pre-filters events based on the `refType` field (reactions and threaded replies).

**Parameters**:
- **Filter by Reference Type** - Currently supports "Note"

**Use when**: You want to process only certain types of reactions or replies.

## Pre-Hydration vs Post-Hydration Filtering

**Pre-Hydration Filtering** (This Node):
- Checks lightweight webhook payload fields (`event`, `data.tags`, `data.stage`, `data.refType`)
- Skips API hydration call if filter doesn't match
- Saves API quota and improves performance

**Post-Hydration Filtering** (Use Switch/If Nodes):
- For complex filtering on full resource data (e.g., property city, price ranges, custom fields)
- Place a **Switch** or **If** node after the Handler to filter on hydrated data

## Example Workflows

### Example 1: Hot Lead Tag Workflow
```
Trigger (People Tags Created) 
  → Handler (Filter: Tags Created → "Hot Lead")
    → Send Slack Notification
```

### Example 2: Stage Change Automation
```
Trigger (People Stage Updated)
  → Handler (Filter: Stage Updated → "Under Contract")
    → Create Task
    → Send Email
```

### Example 3: Multi-Event Processing
```
Trigger (People Updated)
  → Handler (Filter: Webhook Event → peopleUpdated, peopleCreated)
    → Switch (on hydrated data)
      → Case 1: Price > $500k → High-value workflow
      → Case 2: Price < $500k → Standard workflow
```

## Credentials

This node uses the same **Follow Up Boss API** credential as the main node and trigger. See [Follow Up Boss API Credentials](../../credentials/FollowUpBossApi.credentials.md).

## Related Nodes

- **[Follow Up Boss Trigger](FollowUpBossTrigger.md)** - Receives webhook events (use upstream)
- **[Follow Up Boss](FollowUpBoss.md)** - Main node for API operations
