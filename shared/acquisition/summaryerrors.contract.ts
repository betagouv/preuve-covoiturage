import { ParamsInterface as SearchErrorInterface } from './searcherrors.contract';

export enum GroupByOptions {
  operator_id = 'operator_id',
  journey_id = 'journey_id',
  error_stage = 'error_stage',
}

export interface ParamsInterface extends SearchErrorInterface {
  group_by: GroupByOptions;
}

export type ResultInterface = { [key: string]: number };

export const handlerConfig = {
  service: 'acquisition',
  method: 'summaryerrors',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
