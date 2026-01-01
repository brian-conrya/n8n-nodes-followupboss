# Follow Up Boss API Credentials

You can use these credentials to authenticate with the Follow Up Boss API.

## Prerequisites

You need a Follow Up Boss account.

## Supported Authentication Methods

- **API Key + System Identification**: Requires **API Key**, **System Name**, and **System Key**. All fields are mandatory.

## How to get the Credentials

### API Key

1.  Log in to your [Follow Up Boss account](https://app.followupboss.com/).
2.  Go to **Admin** > **API**.
3.  Click **Create API Key**.
4.  Give your key a name (e.g., "n8n").
5.  Click **Create API Key** and copy the key.

### System Name and System Key

All integrations must allow the user to input their `X-System` and `X-System-Key`. These are required to identify your integration system.

1.  Refer to the [Follow Up Boss API Documentation](https://docs.followupboss.com/docs/system) on System Registration.
2.  Register your system with Follow Up Boss to obtain these keys.
3.  Once obtained, enter the **System Name** (X-System) and **System Key** (X-System-Key) in the n8n credential configuration.

## Using the Credentials

Select **Follow Up Boss API** as the **Credential Type** in the Follow Up Boss node and select your configured credential.
Enter your **API Key**, **System Name**, and **System Key**. All three are required to authenticate and use the node.
