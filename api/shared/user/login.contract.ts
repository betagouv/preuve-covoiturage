import { UserInterface } from './common/interfaces/UserInterface';

export interface ParamsInterface {
  email: string;
  password: string;
}

export interface ResultInterface extends UserInterface {}

export const configHandler = {
  service: 'user',
  method: 'login',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
