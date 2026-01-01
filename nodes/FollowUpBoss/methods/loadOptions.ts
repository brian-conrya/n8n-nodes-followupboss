import { INodePropertyOptions, ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';
import { apiRequestAllItems } from '../transport';
import * as listSearch from './listSearch';

const wrapListSearch = (
	method: (
		this: ILoadOptionsFunctions,
		filter?: string,
	) => Promise<{ results: INodePropertyOptions[] }>,
) => {
	return async function (
		this: ILoadOptionsFunctions,
		filter?: string,
	): Promise<INodePropertyOptions[]> {
		const { results } = await method.call(this, filter);
		return results;
	};
};

export const getActionPlans = wrapListSearch(listSearch.getActionPlans);
export const getAutomations = wrapListSearch(listSearch.getAutomations);
export const getStages = wrapListSearch(listSearch.getStages);
export const getUsers = wrapListSearch(listSearch.getUsers);

export async function getStageNames(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
	const results = await apiRequestAllItems.call(this, '/stages', {});
	return (results as IDataObject[])
		.map((item) => ({
			name: item.name as string,
			value: item.name as string,
		}))
		.sort((a, b) => a.name.localeCompare(b.name));
}
