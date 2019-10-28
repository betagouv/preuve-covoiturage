import { OperatorInterface } from './common/interfaces/OperatorInterface';

export interface ParamsInterface {
  _id: string;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'operator',
  method: 'delete',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
