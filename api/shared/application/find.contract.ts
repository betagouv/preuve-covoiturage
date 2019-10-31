import { ApplicationInterface } from './common/interfaces/ApplicationInterface';

export interface ParamsInterface {
  _id: string;
}

export interface ResultInterface extends ApplicationInterface {}

export const handlerConfig = {
  service: 'application',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
