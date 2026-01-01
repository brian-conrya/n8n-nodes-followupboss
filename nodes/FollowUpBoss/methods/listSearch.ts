import { IDataObject, ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { apiRequestAllItems, apiRequestPagination } from '../transport';

//======================
// Searchable Resources
//======================

export async function getPeople(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	if (filter) {
		query.name = filter;
	}
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/people',
		{},
		query,
		paginationToken,
	);
	let mapped = data.map((item: IDataObject) => ({
		name: `${item.firstName} ${item.lastName}`,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped, paginationToken: nextUrl };
}

export async function getUnclaimedPeople(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results = await apiRequestAllItems.call(this, '/people/unclaimed', {});
	let mapped = results.map((item: IDataObject) => ({
		name: (item.name as string) || `${item.firstName} ${item.lastName}`,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getTasks(
	this: ILoadOptionsFunctions,
	filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	if (filter) {
		query.name = filter;
	}
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/tasks',
		{},
		query,
		paginationToken,
	);
	let mapped = data.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped, paginationToken: nextUrl };
}

//======================
// Full List Resources
//======================

export async function getActionPlans(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results = await apiRequestAllItems.call(this, '/actionPlans', {});
	let mapped = results.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getAutomations(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results = await apiRequestAllItems.call(this, '/automations', {});
	let mapped = results.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getManualAutomations(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results = await apiRequestAllItems.call(this, '/automations', { manualOnly: true });
	let mapped = results.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getPipelineStages(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const pipelines = await apiRequestAllItems.call(this, '/pipelines', {});
	let stages: { name: string; value: number }[] = [];
	pipelines.forEach((p) => {
		const pipelineName = p.name as string;
		if (p.stages) {
			(p.stages as IDataObject[]).forEach((stage) => {
				stages.push({
					name: `${pipelineName} ${stage.name as string}`,
					value: stage.id as number,
				});
			});
		}
	});
	if (filter) {
		stages = stages.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: stages.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getStages(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results = await apiRequestAllItems.call(this, '/stages', {});
	let mapped = results.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getUsers(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results = await apiRequestAllItems.call(this, '/users', {});
	let mapped = results.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getAgents(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results = await apiRequestAllItems.call(this, '/users', { role: 'Broker,Agent' });
	let mapped = results.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getSmartLists(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results = await apiRequestAllItems.call(this, '/smartLists', { fub2: true });
	let mapped = results.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getTeams(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results = await apiRequestAllItems.call(this, '/teams', {});
	let mapped = results.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getTimeframes(
	this: ILoadOptionsFunctions,
	filter?: string,
): Promise<INodeListSearchResult> {
	const results = await apiRequestAllItems.call(this, '/timeframes', {});
	let mapped = results.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	if (filter) {
		mapped = mapped.filter((item) => item.name.toLowerCase().includes(filter.toLowerCase()));
	}
	return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

//======================
// Paginated Resources
//======================

export async function getDeals(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const pipelines = await apiRequestAllItems.call(this, '/pipelines', {});
	const pipelineMap: { [key: number]: string } = {};
	for (const pipeline of pipelines) {
		pipelineMap[pipeline.id as number] = pipeline.name as string;
	}

	const query: IDataObject = {
		sort: 'name',
		isArchived: false,
	};

	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/deals',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => {
		const pipelineName = pipelineMap[item.pipelineId as number] || 'Unknown Pipeline';
		return {
			name: `[${pipelineName}] ${item.name}`,
			value: item.id as number,
		};
	});

	return { results: mapped, paginationToken: nextUrl };
}

export async function getCalls(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/calls',
		{},
		{},
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: `Call at ${item.created}`,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getEvents(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/events',
		{},
		{},
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: `${item.message || item.type} at ${item.created}`,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getAppointments(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/appointments',
		{},
		{},
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: `${item.title} (${item.start})`,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getPeopleRelationships(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/peopleRelationships',
		{},
		{},
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: `${item.type || 'Relationship'}: ${item.firstName || ''} ${item.lastName || ''} (Owner: ${item.personId})`,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getEmailMarketingCampaigns(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/emCampaigns',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: (item.name as string) || `Campaign ${item.id}`,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getActionPlansPeople(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/actionPlansPeople',
		{},
		{},
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: `Action Plan Assignment ${item.id} (${item.actionPlanId} for person ${item.personId})`,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getAutomationsPeople(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/automationsPeople',
		{},
		{},
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: `Assignment ${item.id} (${item.automationName} for ${item.personId})`,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getCustomFields(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/customFields',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.label as string,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getCustomFieldNames(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/customFields',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.label as string,
		value: item.name as string,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getDealCustomFields(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/dealCustomFields',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.label as string,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getDealCustomFieldNames(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/dealCustomFields',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.label as string,
		value: item.name as string,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getLenders(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		role: 'Lender',
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/users',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getTextMessageTemplates(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/textMessageTemplates',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getPipelines(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/pipelines',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getAppointmentTypes(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/appointmentTypes',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getAppointmentOutcomes(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/appointmentOutcomes',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getEmailTemplates(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/templates',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getGroups(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/groups',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}

export async function getPonds(
	this: ILoadOptionsFunctions,
	_filter?: string,
	paginationToken?: string,
): Promise<INodeListSearchResult> {
	const query: IDataObject = {
		sort: 'name',
	};
	const { data, nextUrl } = await apiRequestPagination.call(
		this,
		'GET',
		'/ponds',
		{},
		query,
		paginationToken,
	);
	const mapped = data.map((item: IDataObject) => ({
		name: item.name as string,
		value: item.id as number,
	}));
	return { results: mapped, paginationToken: nextUrl };
}
