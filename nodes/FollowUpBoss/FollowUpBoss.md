# Follow Up Boss Node

The Follow Up Boss node allows you to integrate [Follow Up Boss](https://www.followupboss.com/) into your n8n workflows. Follow Up Boss is a leading CRM for high-growth real estate teams.

## Content

- [Operations](#operations)
- [Webhook Event Resource](#webhook-event-resource)
- [Credentials](#credentials)

## Operations

This node supports the following resources and operations:

- **Action Plans**: Get, Get Many
- **Action Plans (People)**: Get, Get Many
- **Appointments**: Create, Update, Get, Get Many, Delete
- **Appointment Outcomes**: Get Many
- **Appointment Types**: Get Many
- **Automations**: Get, Get Many
- **Automations (People)**: Get, Get Many
- **Calls**: Log Call, Get, Get Many
- **Custom Fields**: Create, Update, Get, Get Many, Delete
- **Deals**: Create, Update, Get, Get Many, Delete
- **Deal Attachments**: Create, Update, Get, Delete
- **Deal Custom Fields**: Create, Update, Get, Get Many, Delete
- **Email Marketing Campaigns**: Get, Get Many
- **Email Marketing Events**: Get Many
- **Email Templates**: Get, Get Many
- **Events**: Create, Get, Get Many
- **Groups**: Get, Get Many
- **Notes**: Create, Update, Get, Get Many, Delete
- **People**: Create, Update, Get, Get Many, Delete, Add Tags, Remove Tags, Add Collaborators, Remove Collaborators
- **People Relationships**: Create, Update, Delete
- **Person Attachments**: Create, Get, Delete
- **Pipelines**: Get, Get Many, Update
- **Ponds**: Get, Get Many
- **Reactions**: Create
- **Smart Lists**: Get, Get Many
- **Stages**: Create, Update, Get, Get Many, Delete
- **Tasks**: Create, Update, Get, Get Many, Delete
- **Teams**: Get, Get Many
- **Text Messages**: Get, Get Many, Send
- **Text Message Templates**: Get, Get Many
- **Users**: Get, Get Many
- **Webhook Event**: Get Full Data, Filter by Webhook Event, Filter by Stage Updated, Filter by Tags Created, Filter by Person Event ([details below](#webhook-event-resource))

## Webhook Event Resource

The **Webhook Event** resource processes webhook payloads emitted by the [Follow Up Boss Trigger](FollowUpBossTrigger.md). It fetches full resource data from the API and provides filtering capabilities.

### Use Case

Place this resource downstream from the Trigger:

```
Trigger → Follow Up Boss (Webhook Event) → [Other Nodes]
  ↓                  ↓
 Raw            Full Data
Payload        + Filtered
```

The Trigger outputs lightweight webhook payloads, and this resource fetches the full data from the Follow Up Boss API while optionally filtering events before making expensive API calls.

### Why a Dedicated Resource?

Follow Up Boss limits the number of webhooks you can register (effectively one production webhook per event type). By keeping the Trigger lightweight and moving data fetching/filtering into a downstream operation, you can:

1. **Maximize webhook efficiency** — Register one webhook per event type and branch into multiple Follow Up Boss "Webhook Event" configurations downstream
2. **Reuse webhooks** — A single `People Updated` trigger can feed multiple workflow branches with different filtering criteria
3. **Reduce API quota usage** — Pre-filter events before fetching full data from the API

```
                                            ┌→ Webhook Event (Filter by Tags Created) → Workflow A
Trigger (People Tags Created) ──────────────┼→ Webhook Event (Filter by Webhook Event) → Workflow B
                                            └→ Webhook Event (Get Full Data) → Workflow C
```

For multiple separate workflows, use the **Execute Workflow** node to fan out from a single dispatcher workflow.

### Operations

#### Get Full Data

Fetches the complete resource data for any webhook event without filtering.

**Use when**: You want full data for all webhook events.

---

#### Filter by Webhook Event

Pre-filters based on the webhook event type before fetching full data.

**Parameters**:

- **Filter by Webhook Event** — Select which webhook event types to process (e.g., `peopleCreated`, `appointmentsUpdated`, `notesCreated`)

**Use when**: You only care about specific event types and want to avoid unnecessary API calls for others.

---

#### Filter by Tags Created

Pre-filters `People Tags Created` events based on which tags were added.

**Parameters**:

- **Tags Input Mode** — Choose between manual entry or JSON array
- **Filter by Tags (Manual)** — Enter tags one per line (when mode is "Manual")
- **Filter by Tags (JSON)** — Map a JSON array of tag names (when mode is "Map / JSON Array")

**Use when**: You want to trigger workflows only when specific tags are added to people (e.g., "Hot Lead", "VIP Client").

---

#### Filter by Stage Updated

Pre-filters `People Stage Updated` events based on which stage people moved to.

**Parameters**:

- **Filter by Stage** — Select stage names from dropdown

**Use when**: You want workflows to run only when people enter specific pipeline stages (e.g., "Under Contract", "Closed").

---

#### Filter by Person Event

Filters `eventsCreated` webhook events with comprehensive criteria for person-level activities like inquiries, registrations, and property engagement.

**Parameters**:

- **Event Source** — Filter by the top-level source (e.g., "Zillow", "Realtor.com")
- **Person IDs** — Comma-separated list of Person IDs to filter by
- **Event Types** — Filter by specific event types:
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

- **City** — Exact city name match
- **State** — Exact state code match (e.g., "PA")
- **Zip Code** — Exact zip code match
- **Neighborhood** — Contains match (case-insensitive)
- **MLS Number** — Exact MLS number match
- **Min Price** / **Max Price** — Price range filters

**Engagement Filters** (optional collection):

- **URL** — Page URL contains (case-insensitive)
- **Page Title** — Page title contains (case-insensitive)
- **Message** — Message or description contains (case-insensitive)

**Campaign Filters** (optional collection):

- **Campaign Name** — Campaign name contains (case-insensitive)
- **Source** — Campaign source contains (case-insensitive)
- **Medium** — Campaign medium contains (case-insensitive)
- **Term** — Campaign term contains (case-insensitive)
- **Content** — Campaign content contains (case-insensitive)

**Use when**: You want fine-grained control over which person events trigger your workflow, such as filtering for Zillow leads with properties over $500k in specific cities.

### How Filtering Works

**Pre-Fetch Filtering** (Webhook Event, Tags Created, Stage Updated):

- Checks lightweight webhook payload fields (`event`, `data.tags`, `data.stage`)
- Skips API call if filter doesn't match — saves quota

**Post-Fetch Filtering** (Person Event filters):

- First fetches full event data, then applies detailed filters
- Allows filtering on property details, engagement data, campaign info
- Useful when you need data not available in the webhook payload

**Post-Operation Filtering** (Use Filter/Switch/If Nodes):

- For complex filtering beyond what this resource provides
- Place a **Filter**, **Switch**, or **If** node after the Follow Up Boss node to filter on any field

### Example Workflows

#### Hot Lead Tag Workflow

```
Trigger (People Tags Created)
  → Follow Up Boss (Webhook Event → Filter by Tags Created → "Hot Lead")
    → Send Slack Notification
```

#### Stage Change Automation

```
Trigger (People Stage Updated)
  → Follow Up Boss (Webhook Event → Filter by Stage Updated → "Under Contract")
    → Create Task
    → Send Email
```

#### Multi-Event Processing

```
Trigger (People Updated)
  → Follow Up Boss (Webhook Event → Filter by Webhook Event → peopleUpdated, peopleCreated)
    → Switch (on full data)
      → Case 1: custom condition → Workflow A
      → Case 2: other condition → Workflow B
```

#### High-Value Zillow Lead Filtering

```
Trigger (Events Created)
  → Follow Up Boss (Webhook Event → Filter by Person Event)
      Event Source: "Zillow"
      Event Types: "Property Inquiry"
      Property Filters: Min Price: 500000
    → Create High-Priority Task
    → Notify Agent
```

#### Local Engagement Tracking

```
Trigger (Events Created)
  → Follow Up Boss (Webhook Event → Filter by Person Event)
      Event Types: "Viewed Property", "Registration"
      Property Filters: City: "Philadelphia", State: "PA"
    → Log Local Lead Activity
```

## Credentials

This node supports both API Key and OAuth2 authentication.

- [API Key Credentials](../../credentials/FollowUpBossApi.credentials.md)
- [OAuth2 Credentials](../../credentials/FollowUpBossOAuth2Api.credentials.md)

## Resources

- [Follow Up Boss API Documentation](https://docs.followupboss.com/)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
