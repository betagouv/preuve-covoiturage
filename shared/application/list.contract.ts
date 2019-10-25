import { ApplicationInterface } from './common/interfaces/ApplicationInterface';

export interface ParamsInterface {
  operator_id: string;
}

export type ResultInterface = ApplicationInterface[];

export const handlerConfig = {
  service: 'application',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
