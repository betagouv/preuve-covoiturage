import { UserInterface } from './common/interfaces/UserInterface';

export interface ParamsInterface {
  email: string;
  password: string;
}

export interface ResultInterface extends UserInterface {}

export const handlerConfig = {
  service: 'user',
  method: 'login',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
