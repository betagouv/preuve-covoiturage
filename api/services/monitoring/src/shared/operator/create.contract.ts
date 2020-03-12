import { OperatorInterface } from './common/interfaces/OperatorInterface';
import { OperatorDbInterface } from './common/interfaces/OperatorDbInterface';

export interface ParamsInterface extends OperatorInterface {}

export interface ResultInterface extends OperatorDbInterface {}

export const handlerConfig = {
  service: 'operator',
  method: 'create',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
