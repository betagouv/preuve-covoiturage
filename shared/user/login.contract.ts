import { UserInterface } from './common/interfaces/UserInterface.ts';

export interface ParamsInterface {
  email: string;
  password: string;
}

export interface ResultInterface extends UserInterface {}

export const handlerConfig = {
  service: 'user',
  method: 'login',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
