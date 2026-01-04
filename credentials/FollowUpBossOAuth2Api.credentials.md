# Follow Up Boss OAuth2 Credentials

Follow the steps below to configure OAuth2 credentials for Follow Up Boss in n8n.

## Prerequisites

Before you can set up OAuth2, you must have a **Registered System** in Follow Up Boss.

1.  Log in to your Follow Up Boss account.
2.  Go to the [System Registration page](https://apps.followupboss.com/system-registration).
3.  Register your system to obtain a **System Name (X-System)** and **System Key (X-System-Key)**.
    *   **Keep these keys safe!** You will need them to create your OAuth App and configure the credentials in n8n.

## Create an OAuth Client App

Once you have your Registered System, you need to create an OAuth Client App to obtain a **Client ID** and **Client Secret**.

1.  Open a terminal or use a tool like Postman/cURL.
2.  Make a `POST` request to `https://api.followupboss.com/v1/oauthApps`.
3.  Include your `X-System` and `X-System-Key` in the headers.
4.  In the request body, provide your n8n redirect URI as an array.

### cURL Example

Replace `<your-system-name>`, `<your-system-key>`, and `<your-n8n-redirect-uri>` with your actual values.

```bash
curl --location --request POST 'https://api.followupboss.com/v1/oauthApps' \
--header 'X-System: <your-system-name>' \
--header 'X-System-Key: <your-system-key>' \
--header 'Content-Type: application/json' \
--data '{
    "redirectUris": ["<your-n8n-redirect-uri>"]
}'
```

> [!TIP]
> You can find your **OAuth Redirect URL** in the n8n credential configuration screen. It usually looks like `https://your-n8n-instance.com/rest/oauth2-credential/callback`.

### Response

The response will contain your `clientId` and `clientSecret`.

```json
{
    "id": 12,
    "name": "My n8n Integration",
    "redirectUris": ["https://your-n8n-instance.com/rest/oauth2-credential/callback"],
    "clientId": "your_client_id_here",
    "clientSecret": "your_client_secret_here",
    "status": 1,
    ...
}
```

> [!IMPORTANT]
> The `clientSecret` is **only returned once** when the application is created. Store it securely!

## Configuring Credentials in n8n

Now you can fill in the fields in n8n:

1.  **System Name (X-System)**: The name you used when registering your system.
2.  **System Key (X-System-Key)**: The secret key for your registered system.
3.  **Client ID**: The `clientId` from your OAuth Client App.
4.  **Client Secret**: The `clientSecret` from your OAuth Client App.

Once filled, click **Connect my account** to complete the OAuth flow.
