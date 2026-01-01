import {
	IDataObject,
	IDisplayOptions,
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
} from 'n8n-workflow';
import { apiRequest } from '../../transport';
import { toInt, updateDisplayOptions, wrapData } from '../../helpers/utils';

const displayOptions: IDisplayOptions = {
	show: {
		resource: ['pipelines'],
		operation: ['create'],
	},
};

const properties: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		default: '',
		required: true,
		placeholder: 'Buyer pipeline',
		description: 'Name of the pipeline',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
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
				displayName: 'Order Weight',
				name: 'orderWeight',
				type: 'string',
				default: '',
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
		placeholder: 'Add Stage',
		description: 'An array of stage objects that should be associated with the pipeline',
		options: [
			{
				name: 'stageValues',
				displayName: 'Stage',
				values: [
					{
						displayName: 'Closed Stage',
						name: 'closedStage',
						type: 'boolean',
						default: false,
						required: true,
						description: 'Whether this is a closed stage',
					},
					{
						displayName: 'Color',
						name: 'color',
						type: 'color',
						default: '',
						placeholder: '#FFFFFF',
						description: 'Color for the stage',
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
						type: 'string',
						default: '',
						placeholder: '1000',
						description: 'Set this value to enforce a specific sort order',
					},
				],
			},
		],
	},
];

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(this: IExecuteFunctions, i: number): Promise<INodeExecutionData[]> {
	const name = this.getNodeParameter('name', i) as string;
	const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;
	const stagesData = this.getNodeParameter('stages', i, {}) as IDataObject;

	const body: IDataObject = { name };

	if (additionalFields.description) {
		body.description = additionalFields.description;
	}

	if (additionalFields.orderWeight) {
		body.orderWeight = toInt(
			additionalFields.orderWeight as string,
			'Order Weight',
			this.getNode(),
			i,
		);
	}

	if (stagesData.stageValues && Array.isArray(stagesData.stageValues)) {
		body.stages = stagesData.stageValues.map((stage) => {
			const stageObj: IDataObject = {
				name: stage.name,
				closedStage: stage.closedStage ?? false,
			};

			if (stage.description) {
				stageObj.description = stage.description;
			}

			if (stage.orderWeight) {
				stageObj.orderWeight = toInt(
					stage.orderWeight as string,
					'Stage Order Weight',
					this.getNode(),
					i,
				);
			}

			if (stage.color) {
				stageObj.color = stage.color;
			}

			return stageObj;
		});
	}

	const response = await apiRequest.call(this, 'POST', '/pipelines', body);
	return wrapData(response);
}
