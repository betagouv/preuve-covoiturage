import { OperatorDbInterface } from './common/interfaces/OperatorDbInterface';

export type ParamsInterface = void;

export type ResultInterface = OperatorDbInterface[];

export const handlerConfig = {
  service: 'operator',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
