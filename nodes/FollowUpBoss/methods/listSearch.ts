import { IDataObject, ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { apiRequestAllItems, apiRequestPagination } from '../transport';

//======================
// Searchable Resources
//======================

export async function getPeople(this: ILoadOptionsFunctions, filter?: string, paginationToken?: string): Promise<INodeListSearchResult> {
    const query: IDataObject = {
        sort: 'name',
    };
    if (filter) {
        query.name = filter;
    }
    const { data, nextUrl } = await apiRequestPagination.call(this, 'GET', '/people', {}, query, paginationToken);
    let mapped = data.map((item: IDataObject) => ({
        name: `${item.firstName} ${item.lastName}`,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped, paginationToken: nextUrl };
}

export async function getTasks(this: ILoadOptionsFunctions, filter?: string, paginationToken?: string): Promise<INodeListSearchResult> {
    const query: IDataObject = {
        sort: 'name',
    };
    if (filter) {
        query.name = filter;
    }
    const { data, nextUrl } = await apiRequestPagination.call(this, 'GET', '/tasks', {}, query, paginationToken);
    let mapped = data.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped, paginationToken: nextUrl };
}

//======================
// Recent-Only Resources
//======================

export async function getDeals(this: ILoadOptionsFunctions, _filter?: string, paginationToken?: string): Promise<INodeListSearchResult> {
    // Fetch pipelines first to get names
    const pipelines = await apiRequestAllItems.call(this, '/pipelines', {});
    const pipelineMap: { [key: number]: string } = {};
    for (const pipeline of pipelines) {
        pipelineMap[pipeline.id as number] = pipeline.name as string;
    }

    const query: IDataObject = {
        sort: '-updated',
        isArchived: false,
    };

    const { data, nextUrl } = await apiRequestPagination.call(this, 'GET', '/deals', {}, query, paginationToken);
    const mapped = data.map((item: IDataObject) => {
        const pipelineName = pipelineMap[item.pipelineId as number] || 'Unknown Pipeline';
        return {
            name: `[${pipelineName}] ${item.name}`,
            value: item.id as number,
        };
    });

    return { results: mapped, paginationToken: nextUrl };
}

export async function getCalls(this: ILoadOptionsFunctions, _filter?: string, paginationToken?: string): Promise<INodeListSearchResult> {
    const query: IDataObject = {
        sort: '-updated',
    };
    const { data, nextUrl } = await apiRequestPagination.call(this, 'GET', '/calls', {}, query, paginationToken);
    const mapped = data.map((item: IDataObject) => ({
        name: `Call at ${item.created}`,
        value: item.id as number,
    }));
    return { results: mapped, paginationToken: nextUrl };
}

export async function getNotes(this: ILoadOptionsFunctions, _filter?: string, paginationToken?: string): Promise<INodeListSearchResult> {
    const query: IDataObject = {
        sort: '-updated',
    };
    const { data, nextUrl } = await apiRequestPagination.call(this, 'GET', '/notes', {}, query, paginationToken);
    const mapped = data.map((item: IDataObject) => ({
        name: `Note: ${item.subject || item.body || item.created}`,
        value: item.id as number,
    }));
    return { results: mapped, paginationToken: nextUrl };
}

export async function getEvents(this: ILoadOptionsFunctions, _filter?: string, paginationToken?: string): Promise<INodeListSearchResult> {
    const query: IDataObject = {
        sort: '-updated',
    };
    const { data, nextUrl } = await apiRequestPagination.call(this, 'GET', '/events', {}, query, paginationToken);
    const mapped = data.map((item: IDataObject) => ({
        name: `${item.message || item.type} at ${item.created}`,
        value: item.id as number,
    }));
    return { results: mapped, paginationToken: nextUrl };
}

export async function getAppointments(this: ILoadOptionsFunctions, _filter?: string, paginationToken?: string): Promise<INodeListSearchResult> {
    const query: IDataObject = {
        sort: '-updated',
    };
    const { data, nextUrl } = await apiRequestPagination.call(this, 'GET', '/appointments', {}, query, paginationToken);
    const mapped = data.map((item: IDataObject) => ({
        name: `${item.title} (${item.start})`,
        value: item.id as number,
    }));
    return { results: mapped, paginationToken: nextUrl };
}

export async function getPeopleRelationships(this: ILoadOptionsFunctions, _filter?: string, paginationToken?: string): Promise<INodeListSearchResult> {
    const { data, nextUrl } = await apiRequestPagination.call(this, 'GET', '/peopleRelationships', {}, {}, paginationToken);
    const mapped = data.map((item: IDataObject) => ({
        name: `${item.type || 'Relationship'}: ${item.firstName || ''} ${item.lastName || ''} (Owner: ${item.ownerId})`,
        value: item.id as number,
    }));
    return { results: mapped, paginationToken: nextUrl };
}

//======================
// Full List Resources
//======================

export async function getActionPlans(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/actionPlans', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getAutomations(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/automations', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getStages(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/stages', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.name as string, // Stage value is name
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getGroups(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/groups', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getUsers(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/users', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getAgents(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/users', { role: 'Agent' });
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getPonds(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/ponds', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getSmartLists(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/smartLists', { fub2: true });
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getPipelines(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/pipelines', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getPipelineStages(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const pipelines = await apiRequestAllItems.call(this, '/pipelines', {});
    let stages: { name: string; value: number }[] = [];
    pipelines.forEach(p => {
        const pipelineName = p.name as string;
        if (p.stages) {
            (p.stages as IDataObject[]).forEach(stage => {
                stages.push({
                    name: `${pipelineName} ${stage.name as string}`,
                    value: stage.id as number,
                });
            });
        }
    });
    if (filter) {
        stages = stages.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: stages.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getAppointmentTypes(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/appointmentTypes', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getAppointmentOutcomes(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/appointmentOutcomes', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getEmailTemplates(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/templates', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getCustomFields(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/customFields', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.label as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getDealCustomFields(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/dealCustomFields', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.label as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getTimeframes(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/timeframes', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getLenders(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/users', { role: 'Lender' });
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}

export async function getTextMessageTemplates(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
    const results = await apiRequestAllItems.call(this, '/textMessageTemplates', {});
    let mapped = results.map((item: IDataObject) => ({
        name: item.name as string,
        value: item.id as number,
    }));
    if (filter) {
        mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
    }
    return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
}
