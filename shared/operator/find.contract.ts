import { OperatorInterface } from './common/interfaces/OperatorInterface.ts';

export interface ParamsInterface {
  _id: number;
}

export interface ResultInterface extends OperatorInterface {}

export const handlerConfig = {
  service: 'operator',
  method: 'find',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
