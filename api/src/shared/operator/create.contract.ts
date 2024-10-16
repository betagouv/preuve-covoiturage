import { OperatorInterface } from './common/interfaces/OperatorInterface.ts';
import { OperatorDbInterface } from './common/interfaces/OperatorDbInterface.ts';

export interface ParamsInterface extends OperatorInterface {}

export interface ResultInterface extends OperatorDbInterface {}

export const handlerConfig = {
  service: 'operator',
  method: 'create',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
