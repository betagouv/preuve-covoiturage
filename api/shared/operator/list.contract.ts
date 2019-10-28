import { OperatorInterface } from './common/interfaces/OperatorInterface';

export type ParamsInterface = void;

export type ResultInterface = OperatorInterface[];

export const handlerConfig = {
  service: 'operator',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
