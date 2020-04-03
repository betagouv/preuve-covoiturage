import { ParamsInterface as LogErrorParamsInterface } from './logerror.contract';

export interface ParamsInterface extends LogErrorParamsInterface {}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'acquisition',
  method: 'logrequest',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
