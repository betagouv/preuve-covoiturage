import { OperatorInterface } from './common/interfaces/OperatorInterface';

export interface ParamsInterface extends OperatorInterface {}
export interface ResultInterface extends OperatorInterface {}

export const handlerConfig = {
  service: 'operator',
  method: 'update',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
