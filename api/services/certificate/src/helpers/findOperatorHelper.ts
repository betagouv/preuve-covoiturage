import { ContextType, KernelInterface } from '@ilos/common';

export interface ParamsInterface {
  operator_id: number;
  context: ContextType;
}

export interface ResultsInterface {
  _id: number;
  uuid: string;
  name: string;
}

export interface FindOperatorInterface {
  (params: ParamsInterface): Promise<ResultsInterface>;
}

export const findOperator = (kernel: KernelInterface): FindOperatorInterface =>
  async function findOperator(params: ParamsInterface): Promise<ResultsInterface> {
    const { operator_id, context } = params;

    const operator = await kernel.call(
      'operator:quickfind',
      { _id: operator_id, thumbnail: false },
      {
        ...context,
        channel: { service: 'certificate' },
      },
    );

    return { ...operator, _id: operator_id };
  };
