import { IDataObject, IDisplayOptions, IExecuteFunctions, INodeExecutionData, INodeProperties } from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData, getPipelineIdProperty, getPipelineStageIdProperty } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['pipelines'],
		operation: ['update'],
	},
};

const properties: INodeProperties[] = [
	{
		...getPipelineIdProperty(),
		name: 'id',
		description: 'ID of the pipeline to update. Choose from the list, or specify an ID.',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				placeholder: 'A pipeline for buyers',
				description: 'Description of the pipeline',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				placeholder: 'Buyer pipeline',
				description: 'Name of the pipeline',
			},
			{
				displayName: 'Order Weight',
				name: 'orderWeight',
				type: 'number',
				default: 0,
				placeholder: '1000',
				description: 'Set this value to enforce a specific sort order',
			},
		],
	},
	{
		displayName: 'Stages',
		name: 'stages',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		description: 'An array of stage objects that should be associated with the pipeline',
		options: [
			{
				displayName: 'Stage',
				name: 'stage',
				values: [
					{
						displayName: 'Closed Stage',
						name: 'closedStage',
						type: 'boolean',
						default: false,
						description: 'Whether this is a closed stage',
					},
					{
						displayName: 'Color',
						name: 'color',
						type: 'color',
						default: '',
						placeholder: '#FFFFFF',
						description: 'Color of the stage',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						placeholder: 'A pipeline for buyers',
						description: 'Description of the stage',
					},
					{
						displayName: 'Name',
						name: 'name',
						type: 'string',
						default: '',
						required: true,
						placeholder: 'Buyer pipeline',
						description: 'Name of the stage',
					},
					{
						displayName: 'Order Weight',
						name: 'orderWeight',
						type: 'number',
						default: 0,
						placeholder: '1000',
						description: 'Set this value to enforce a specific sort order',
					},
					{
						...getPipelineStageIdProperty(false),
						name: 'id',
						description: 'ID of the stage to update. If not provided, a new stage will be created. Choose from the list, or specify an ID.',
					},
				],
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	i: number,
): Promise<INodeExecutionData[]> {
	const idRaw = (this.getNodeParameter('id', i) as IDataObject).value as string;
	const id = toInt(idRaw, 'Pipeline ID', this.getNode(), i);

	const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;
	const description = updateFields.description as string;
	const name = updateFields.name as string;
	const orderWeight = updateFields.orderWeight as number;
	const stagesData = this.getNodeParameter('stages', i, {}) as IDataObject;

	const body: IDataObject = {};

	if (description) {
		body.description = description;
	}
	if (name) {
		body.name = name;
	}
	if (orderWeight) {
		body.orderWeight = orderWeight;
	}

	if (stagesData.stage) {
		const stages = stagesData.stage as IDataObject[];
		if (stages.length > 0) {
			body.stages = stages.map(stage => {
				const stageObj: IDataObject = {
					name: stage.name,
					closedStage: stage.closedStage || false,
				};

				if (stage.id) {
					const stageIdRaw = (stage.id as IDataObject).value as string;
					stageObj.id = toInt(stageIdRaw, 'Stage ID', this.getNode(), i);
				}
				if (stage.color) {
					stageObj.color = stage.color;
				}
				if (stage.description) {
					stageObj.description = stage.description;
				}
				if (stage.orderWeight) {
					stageObj.orderWeight = stage.orderWeight;
				}

				return stageObj;
			});
		}
	}

	const response = await apiRequest.call(this, 'PUT', `/pipelines/${id}`, body);
	return wrapData(response);
}
