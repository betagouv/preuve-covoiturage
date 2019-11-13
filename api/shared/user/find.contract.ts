import { UserInterface } from './common/interfaces/UserInterface';

export interface ParamsInterface {
  _id: number;
}

export interface ResultInterface extends UserInterface {}

export const handlerConfig = {
  service: 'user',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
