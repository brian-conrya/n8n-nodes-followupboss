import {
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	IDataObject,
	NodeApiError,
	sleep,
} from 'n8n-workflow';

/**
 * Maximum number of items to request per page from the Follow Up Boss API
 */
const PAGINATION_LIMIT = 100;

/**
 * Maximum number of retry attempts for failed API requests
 * Used for handling rate limits (429) and server errors (5xx)
 */
const MAX_RETRIES = 5;

/**
 * Calculate exponential backoff with jitter
 * Formula: min(((2^n)+random_ms), 64s)
 * @param attempt The attempt number (starts at 1)
 * @returns Wait time in milliseconds
 */
function calculateExponentialBackoff(attempt: number): number {
	return Math.min(Math.pow(2, attempt) * 1000 + Math.random() * 1000, 64000);
}

async function makeRequest(
	context: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	url?: string,
): Promise<IDataObject> {
	const authentication = context.getNodeParameter('authentication', 0, 'apiKey') as string;
	const credentialType = authentication === 'apiKey' ? 'followUpBossApi' : 'followUpBossOAuth2Api';

	const options: IHttpRequestOptions = {
		method: method as IHttpRequestOptions['method'],
		headers: {
			'Content-Type': 'application/json',
		},
		qs,
		body,
		json: true,
		url: url || `https://api.followupboss.com/v1${endpoint}`,
	};

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	const maxRetries = MAX_RETRIES;
	let attempt = 0;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let lastError: any;

	while (attempt <= maxRetries) {
		try {
			return (await context.helpers.httpRequestWithAuthentication.call(
				context,
				credentialType,
				options,
			)) as IDataObject;
		} catch (error) {
			lastError = error;
			attempt++;
			const status = error.response?.status;

			// 429 Too Many Requests
			if (status === 429) {
				const retryAfter = error.response?.headers['retry-after'];
				let waitTime = 0;
				if (retryAfter) {
					waitTime = (parseInt(retryAfter, 10) + 1) * 1000;
				} else {
					waitTime = calculateExponentialBackoff(attempt);
				}
				await sleep(waitTime);
				continue;
			}

			// Other 4xx Errors - Parse error message
			if (status >= 400 && status < 500) {
				const errorMessage = error.response?.data?.errorMessage;
				if (errorMessage) {
					throw new NodeApiError(context.getNode(), error, {
						message: `Follow Up Boss Error (${status}): ${errorMessage}`,
					});
				}
				// Wrap raw 4xx errors if no message provided
				throw new NodeApiError(context.getNode(), error, {
					message: `Follow Up Boss Error (${status})`,
				});
			}

			if (attempt > maxRetries) {
				break;
			}

			// 5xx Server Errors
			if (status >= 500 && status < 600) {
				const backoff = calculateExponentialBackoff(attempt);
				await sleep(backoff);
				continue;
			}

			// Wrap any other errors (e.g. Network errors)
			throw new NodeApiError(context.getNode(), error, {
				message: `Follow Up Boss Error (${status}): ${error.message}`,
			});
		}
	}

	// Attempt to extract helpful error message from the last error, even if it was 5xx
	const errorMessage = lastError?.response?.data?.errorMessage;
	const finalStatus = lastError?.response?.status;
	const statusInsert = finalStatus ? ` (${finalStatus})` : '';

	if (errorMessage) {
		throw new NodeApiError(context.getNode(), lastError, {
			message: `Follow Up Boss Error${statusInsert}: ${errorMessage}`,
		});
	}

	throw new NodeApiError(context.getNode(), lastError, {
		message: `Failed to connect to Follow Up Boss API after multiple attempts.`,
	});
}

export async function apiRequest(
	this: IExecuteFunctions | IWebhookFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<IDataObject> {
	return await makeRequest(this, method, endpoint, body, qs);
}

export async function apiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	endpoint: string,
	qs: IDataObject = {},
	limit?: number,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let nextLink: string | undefined = undefined;
	let firstRun = true;

	do {
		let response: IDataObject | undefined;
		if (nextLink) {
			response = await makeRequest(this, 'GET', '', {}, {}, nextLink);
		} else if (firstRun) {
			const pageLimit = limit !== undefined && limit < PAGINATION_LIMIT ? limit : PAGINATION_LIMIT;
			const qsWithLimit = { ...qs, limit: pageLimit };
			response = await makeRequest(this, 'GET', endpoint, {}, qsWithLimit);
			firstRun = false;
		}

		if (response) {
			const dataKey = Object.keys(response).find((k) => Array.isArray(response[k]));
			if (dataKey) {
				returnData.push.apply(returnData, response[dataKey] as IDataObject[]);
			}
			nextLink = (response._metadata as IDataObject)?.nextLink as string | undefined;
		}

		// Stop pagination early if limit is reached or exceeded
		if (limit !== undefined && returnData.length >= limit) {
			break;
		}
	} while (nextLink);

	// Truncate results to the limit if provided
	if (limit !== undefined && returnData.length > limit) {
		return returnData.slice(0, limit);
	}

	return returnData;
}

export async function apiRequestPagination(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: string,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
	url?: string,
	limit?: number,
): Promise<{ data: IDataObject[]; nextUrl?: string }> {
	const requestQs = { ...qs };
	if (!url && !requestQs.limit) {
		requestQs.limit = limit || PAGINATION_LIMIT;
	}
	const response = await makeRequest(this, method, endpoint, body, requestQs, url);
	const data: IDataObject[] = [];
	const dataKey = Object.keys(response).find((k) => Array.isArray(response[k]));
	if (dataKey) {
		data.push(...(response[dataKey] as IDataObject[]));
	}
	const nextUrl = (response._metadata as IDataObject)?.nextLink as string | undefined;
	return { data, nextUrl };
}
