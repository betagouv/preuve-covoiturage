import { OperatorDbInterface } from './common/interfaces/OperatorDbInterface';

export type ParamsInterface = void;

export type ResultInterface = OperatorDbInterface[];

export const handlerConfig = {
  service: 'operator',
  method: 'list',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
