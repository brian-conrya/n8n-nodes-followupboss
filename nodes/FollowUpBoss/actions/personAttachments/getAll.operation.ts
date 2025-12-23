import { IDataObject, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequestAllItems } from '../../transport';
import {
	addCommonParameters,
	createGetAllOperationDescription,
	getPersonIdProperty,
	toInt,
	wrapData,
} from '../../helpers/utils';

const resource = 'personAttachments';

const resourceSpecificOptions: INodeProperties[] = [
	{
		...getPersonIdProperty(false),
		description: 'ID of the person to get attachments for. Choose from the list, or specify an ID.',
	},
];

export const description: INodeProperties[] = createGetAllOperationDescription({
	resource,
	resourceSpecificOptions,
});

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const returnAll = this.getNodeParameter('returnAll', i) as boolean;
	const options = this.getNodeParameter('options', i, {}) as IDataObject;
	const qs: IDataObject = {};

	const sort = this.getNodeParameter('sort', i, {}) as IDataObject;
	addCommonParameters(options, qs, sort);

	if (options.personId) {
		const personIdRaw = (options.personId as IDataObject).value as string;
		qs.personId = toInt(personIdRaw, 'Person ID', this.getNode(), i);
	}

	const limit = returnAll ? undefined : (this.getNodeParameter('limit', i) as number);
	const attachments = await apiRequestAllItems.call(this, `/${resource}`, qs, limit);

	return wrapData(attachments);
}
