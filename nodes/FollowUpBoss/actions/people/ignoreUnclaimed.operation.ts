import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, getUnclaimedPersonIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['people'],
		operation: ['ignoreUnclaimed'],
	},
};

const properties: INodeProperties[] = [getUnclaimedPersonIdProperty()];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const personIdRaw = (this.getNodeParameter('personId', i) as IDataObject).value as string;
	const personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	await apiRequest.call(this, 'POST', `/people/ignoreUnclaimed/${personId}`);
	return [{ json: { ignored: true } }];
}
