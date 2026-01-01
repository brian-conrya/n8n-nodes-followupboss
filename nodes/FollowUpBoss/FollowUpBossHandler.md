# Follow Up Boss Handler Node

The Follow Up Boss Handler node processes webhook events from the [Follow Up Boss Trigger](FollowUpBossTrigger.md). It fetches full resource data from the API and provides filtering capabilities.

## Use Case

This node is designed to work downstream from the [Follow Up Boss Trigger](FollowUpBossTrigger.md):

```
Trigger → Handler → [Other Nodes]
  ↓         ↓
 Raw     Full Data
Payload  + Filtered
```

The Trigger outputs lightweight webhook payloads, and the Handler fetches the full data from the Follow Up Boss API while optionally filtering events before making expensive API calls.

## Why a Separate Handler Node?

Follow Up Boss limits the number of webhooks you can register. By keeping the Trigger node lightweight and moving data fetching/filtering into a separate Handler node, you can:

1. **Maximize webhook efficiency** - Register one webhook per event type and branch into multiple Handler configurations downstream
2. **Reuse webhooks** - A single `People Updated` trigger can feed multiple workflows with different filtering criteria
3. **Reduce API quota usage** - Pre-filter events before fetching full data from the API

```
                    ┌→ Handler (Filter: Tags) → Workflow A
Trigger (People) ───┼→ Handler (Filter: Stage) → Workflow B
                    └→ Handler (Get Full Data) → Workflow C
```

## Operations

### Get Full Data

Fetches the complete resource data for any webhook event without filtering.

**Use when**: You want full data for all webhook events.

---

### Filter by Webhook Event

Pre-filters based on the webhook event type before fetching full data.

**Parameters**:

- **Filter by Webhook Event** - Select which webhook event types to process (e.g., `peopleCreated`, `appointmentsUpdated`, `notesCreated`)

**Use when**: You only care about specific event types and want to avoid unnecessary API calls for others.

---

### Filter by Tags Created

Pre-filters `People Tags Created` events based on which tags were added.

**Parameters**:

- **Tags Input Mode** - Choose between manual entry or JSON array
- **Filter by Tags (Manual)** - Enter tags one per line (when mode is "Manual")
- **Filter by Tags (JSON)** - Map a JSON array of tag names (when mode is "Map / JSON Array")

**Use when**: You want to trigger workflows only when specific tags are added to people (e.g., "Hot Lead", "VIP Client").

---

### Filter by Stage Updated

Pre-filters `People Stage Updated` events based on which stage people moved to.

**Parameters**:

- **Filter by Stage** - Select stage names from dropdown

**Use when**: You want workflows to run only when people enter specific pipeline stages (e.g., "Under Contract", "Closed").

---

### Filter by Person Event

Filters `eventsCreated` webhook events with comprehensive criteria for person-level activities like inquiries, registrations, and property engagement.

**Parameters**:

- **Event Source** - Filter by the top-level source (e.g., "Zillow", "Realtor.com")
- **Person IDs** - Comma-separated list of Person IDs to filter by
- **Event Types** - Filter by specific event types:
  - General Inquiry
  - Incoming Call
  - Inquiry
  - Property Inquiry
  - Property Search
  - Registration
  - Saved Property
  - Saved Property Search
  - Seller Inquiry
  - Unsubscribed
  - Viewed Page
  - Viewed Property
  - Visited Open House
  - Visited Website

**Property Filters** (optional collection):

- **City** - Exact city name match
- **State** - Exact state code match (e.g., "PA")
- **Zip Code** - Exact zip code match
- **Neighborhood** - Contains match (case-insensitive)
- **MLS Number** - Exact MLS number match
- **Min Price** / **Max Price** - Price range filters

**Engagement Filters** (optional collection):

- **URL** - Page URL contains (case-insensitive)
- **Page Title** - Page title contains (case-insensitive)
- **Message** - Message or description contains (case-insensitive)

**Campaign Filters** (optional collection):

- **Campaign Name** - Campaign name contains (case-insensitive)
- **Source** - Campaign source contains (case-insensitive)
- **Medium** - Campaign medium contains (case-insensitive)
- **Term** - Campaign term contains (case-insensitive)
- **Content** - Campaign content contains (case-insensitive)

**Use when**: You want fine-grained control over which person events trigger your workflow, such as filtering for Zillow leads with properties over $500k in specific cities.

## How Filtering Works

**Pre-Fetch Filtering** (Webhook Event, Tags Created, Stage Updated):

- Checks lightweight webhook payload fields (`event`, `data.tags`, `data.stage`)
- Skips API call if filter doesn't match—saves quota

**Post-Fetch Filtering** (Person Event filters):

- First fetches full event data, then applies detailed filters
- Allows filtering on property details, engagement data, campaign info
- Useful when you need data not available in the webhook payload

**Post-Handler Filtering** (Use Filter/Switch/If Nodes):

- For complex filtering beyond what this node provides
- Place a **Filter**, **Switch**, or **If** node after the Handler to filter on any field

## Example Workflows

### Example 1: Hot Lead Tag Workflow

```
Trigger (People Tags Created)
  → Handler (Filter by Tags Created → "Hot Lead")
    → Send Slack Notification
```

### Example 2: Stage Change Automation

```
Trigger (People Stage Updated)
  → Handler (Filter by Stage Updated → "Under Contract")
    → Create Task
    → Send Email
```

### Example 3: Multi-Event Processing

```
Trigger (People Updated)
  → Handler (Filter by Webhook Event → peopleUpdated, peopleCreated)
    → Switch (on full data)
      → Case 1: custom condition → Workflow A
      → Case 2: other condition → Workflow B
```

### Example 4: High-Value Zillow Lead Filtering

```
Trigger (Events Created)
  → Handler (Filter by Person Event)
      Event Source: "Zillow"
      Event Types: "Property Inquiry"
      Property Filters: Min Price: 500000
    → Create High-Priority Task
    → Notify Agent
```

### Example 5: Local Engagement Tracking

```
Trigger (Events Created)
  → Handler (Filter by Person Event)
      Event Types: "Viewed Property", "Registration"
      Property Filters: City: "Philadelphia", State: "PA"
    → Log Local Lead Activity
```

## Credentials

This node uses the same **Follow Up Boss API** credential as the main node and trigger. See [Follow Up Boss API Credentials](../../credentials/FollowUpBossApi.credentials.md).

## Related Nodes

- **[Follow Up Boss Trigger](FollowUpBossTrigger.md)** - Receives webhook events (use upstream)
- **[Follow Up Boss](FollowUpBoss.md)** - Main node for API operations
