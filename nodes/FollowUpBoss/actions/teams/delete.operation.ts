import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import {
	toInt,
	updateDisplayOptions,
	wrapDeleteSuccess,
	getTeamIdProperty,
} from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['teams'],
		operation: ['delete'],
	},
};

const properties: INodeProperties[] = [
	{
		...getTeamIdProperty(),
		description: 'ID of the team to delete. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				...getTeamIdProperty(false, 'moveToTeamId'),
				displayName: 'Move To Team',
				description: 'ID of the team to move leads to. Choose from the list, or specify an ID.',
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Team ID', this.getNode(), i);
	const qs: IDataObject = {};
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

	if (additionalFields.moveToTeamId) {
		const moveToTeamIdRaw = (additionalFields.moveToTeamId as IDataObject).value as string;
		qs.moveToTeamId = toInt(moveToTeamIdRaw, 'Move To Team ID', this.getNode(), i);
	}

	await apiRequest.call(this, 'DELETE', `/teams/${id}`, {}, qs);
	return wrapDeleteSuccess();
}
