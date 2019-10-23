import { ApplicationInterface } from './common/interfaces/ApplicationInterface';

export interface ParamsInterface {
  operator_id: string;
  name: string;
  permissions: string[];
}

export interface ResultInterface {
  token: string;
  application: ApplicationInterface;
}

export const handlerConfig = {
  service: 'application',
  method: 'create',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
