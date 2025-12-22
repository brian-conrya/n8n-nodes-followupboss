import { INodePropertyOptions, ILoadOptionsFunctions } from 'n8n-workflow';
import * as listSearch from './listSearch';

const wrapListSearch = (method: (this: ILoadOptionsFunctions, filter?: string) => Promise<{ results: INodePropertyOptions[] }>) => {
    return async function (this: ILoadOptionsFunctions, filter?: string): Promise<INodePropertyOptions[]> {
        const { results } = await method.call(this, filter);
        return results;
    };
};

export const getPeople = wrapListSearch(listSearch.getPeople);
export const getTasks = wrapListSearch(listSearch.getTasks);
export const getDeals = wrapListSearch(listSearch.getDeals);
export const getCalls = wrapListSearch(listSearch.getCalls);
export const getNotes = wrapListSearch(listSearch.getNotes);
export const getEvents = wrapListSearch(listSearch.getEvents);
export const getAppointments = wrapListSearch(listSearch.getAppointments);
export const getPeopleRelationships = wrapListSearch(listSearch.getPeopleRelationships);
export const getActionPlans = wrapListSearch(listSearch.getActionPlans);
export const getAutomations = wrapListSearch(listSearch.getAutomations);
export const getStages = wrapListSearch(listSearch.getStages);
export const getGroups = wrapListSearch(listSearch.getGroups);
export const getUsers = wrapListSearch(listSearch.getUsers);
export const getAgents = wrapListSearch(listSearch.getAgents);
export const getPonds = wrapListSearch(listSearch.getPonds);
export const getSmartLists = wrapListSearch(listSearch.getSmartLists);
export const getPipelines = wrapListSearch(listSearch.getPipelines);
export const getPipelineStages = wrapListSearch(listSearch.getPipelineStages);
export const getAppointmentTypes = wrapListSearch(listSearch.getAppointmentTypes);
export const getAppointmentOutcomes = wrapListSearch(listSearch.getAppointmentOutcomes);
export const getEmailTemplates = wrapListSearch(listSearch.getEmailTemplates);
export const getCustomFields = wrapListSearch(listSearch.getCustomFields);
export const getDealCustomFields = wrapListSearch(listSearch.getDealCustomFields);
export const getTimeframes = wrapListSearch(listSearch.getTimeframes);
export const getLenders = wrapListSearch(listSearch.getLenders);
export const getTextMessageTemplates = wrapListSearch(listSearch.getTextMessageTemplates);
