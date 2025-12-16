import { IDataObject, ILoadOptionsFunctions, INodeListSearchResult } from 'n8n-workflow';
import { apiRequestAllItems } from '../transport';

const DEFAULT_LIMIT = 100;

export const listSearch = {
    async people(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const query: IDataObject = {
            sort: '-updated',
        };
        if (filter) {
            query.name = filter;
        }
        const results = await apiRequestAllItems.call(this, '/people', query, DEFAULT_LIMIT);
        let mapped = results.map((item: IDataObject) => ({
            name: `${item.firstName} ${item.lastName}`,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async tasks(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const query: IDataObject = {
            sort: '-updated',
        };
        if (filter) {
            query.name = filter;
        }
        const results = await apiRequestAllItems.call(this, '/tasks', query, DEFAULT_LIMIT);
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    // Recent-Only Resources (No Search)
    async deals(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
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

        const results = await apiRequestAllItems.call(this, '/deals', query, DEFAULT_LIMIT);
        const mapped = results.map((item: IDataObject) => {
            const pipelineName = pipelineMap[item.pipelineId as number] || 'Unknown Pipeline';
            return {
                name: `[${pipelineName}] ${item.name}`,
                value: item.id as number,
            };
        });

        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async calls(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
        const query: IDataObject = {
            sort: '-updated',
        };
        const results = await apiRequestAllItems.call(this, '/calls', query, DEFAULT_LIMIT);
        const mapped = results.map((item: IDataObject) => ({
            name: `Call at ${item.created}`,
            value: item.id as number,
        }));
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async notes(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
        const query: IDataObject = {
            sort: '-updated',
        };
        const results = await apiRequestAllItems.call(this, '/notes', query, DEFAULT_LIMIT);
        const mapped = results.map((item: IDataObject) => ({
            name: `Note: ${item.subject || item.body || item.created}`,
            value: item.id as number,
        }));
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async events(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
        const query: IDataObject = {
            sort: '-updated',
        };
        const results = await apiRequestAllItems.call(this, '/events', query, DEFAULT_LIMIT);
        const mapped = results.map((item: IDataObject) => ({
            name: `${item.message || item.type} at ${item.created}`,
            value: item.id as number,
        }));
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async appointments(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
        const query: IDataObject = {
            sort: '-updated',
        };
        const results = await apiRequestAllItems.call(this, '/appointments', query, DEFAULT_LIMIT);
        const mapped = results.map((item: IDataObject) => ({
            name: `${item.title} (${item.start})`,
            value: item.id as number,
        }));
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async peopleRelationships(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/peopleRelationships', {}, DEFAULT_LIMIT);
        const mapped = results.map((item: IDataObject) => ({
            name: `${item.type || 'Relationship'}: ${item.firstName || ''} ${item.lastName || ''} (Owner: ${item.ownerId})`,
            value: item.id as number,
        }));
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    // Full List Resources (Dropdown style replacement)
    async actionPlans(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/actionPlans', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async automations(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/automations', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async stages(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/stages', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.name as string, // Stage value is name
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async groups(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/groups', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async users(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/users', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async agents(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/users', { role: 'Agent' });
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async ponds(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/ponds', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async smartLists(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/smartLists', { fub2: true });
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async pipelines(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/pipelines', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async pipelineStages(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
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
    },
    async appointmentTypes(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/appointmentTypes', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async appointmentOutcomes(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/appointmentOutcomes', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async emailTemplates(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/templates', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async customFields(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/customFields', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.label as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async dealCustomFields(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/dealCustomFields', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.label as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async timeframes(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/timeframes', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async lenders(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/users', { role: 'Lender' });
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
    async textMessageTemplates(this: ILoadOptionsFunctions, filter?: string): Promise<INodeListSearchResult> {
        const results = await apiRequestAllItems.call(this, '/textMessageTemplates', {});
        let mapped = results.map((item: IDataObject) => ({
            name: item.name as string,
            value: item.id as number,
        }));
        if (filter) {
            mapped = mapped.filter(item => item.name.toLowerCase().includes(filter.toLowerCase()));
        }
        return { results: mapped.sort((a, b) => a.name.localeCompare(b.name)) };
    },
};