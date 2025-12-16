import { INodePropertyOptions, ILoadOptionsFunctions } from 'n8n-workflow';
import { listSearch } from './listSearch';

const wrapListSearch = (method: (this: ILoadOptionsFunctions, filter?: string) => Promise<{ results: INodePropertyOptions[] }>) => {
    return async function (this: ILoadOptionsFunctions, filter?: string): Promise<INodePropertyOptions[]> {
        const { results } = await method.call(this, filter);
        return results;
    };
};

export const getPeople = wrapListSearch(listSearch.people);
export const getTasks = wrapListSearch(listSearch.tasks);
export const getDeals = wrapListSearch(listSearch.deals);
export const getCalls = wrapListSearch(listSearch.calls);
export const getNotes = wrapListSearch(listSearch.notes);
export const getEvents = wrapListSearch(listSearch.events);
export const getAppointments = wrapListSearch(listSearch.appointments);
export const getPeopleRelationships = wrapListSearch(listSearch.peopleRelationships);
export const getActionPlans = wrapListSearch(listSearch.actionPlans);
export const getAutomations = wrapListSearch(listSearch.automations);
export const getStages = wrapListSearch(listSearch.stages);
export const getGroups = wrapListSearch(listSearch.groups);
export const getUsers = wrapListSearch(listSearch.users);
export const getAgents = wrapListSearch(listSearch.agents);
export const getPonds = wrapListSearch(listSearch.ponds);
export const getSmartLists = wrapListSearch(listSearch.smartLists);
export const getPipelines = wrapListSearch(listSearch.pipelines);
export const getPipelineStages = wrapListSearch(listSearch.pipelineStages);
export const getAppointmentTypes = wrapListSearch(listSearch.appointmentTypes);
export const getAppointmentOutcomes = wrapListSearch(listSearch.appointmentOutcomes);
export const getEmailTemplates = wrapListSearch(listSearch.emailTemplates);
export const getCustomFields = wrapListSearch(listSearch.customFields);
export const getDealCustomFields = wrapListSearch(listSearch.dealCustomFields);
export const getTimeframes = wrapListSearch(listSearch.timeframes);
export const getLenders = wrapListSearch(listSearch.lenders);
export const getTextMessageTemplates = wrapListSearch(listSearch.textMessageTemplates);
