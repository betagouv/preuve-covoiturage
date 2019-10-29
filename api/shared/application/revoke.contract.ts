import { ApplicationInterface } from './common/interfaces/ApplicationInterface';

export interface ParamsInterface {
  _id: string;
  operator_id: string;
}

export type ResultInterface = boolean;

export const handlerConfig = {
  service: 'application',
  method: 'revoke',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
