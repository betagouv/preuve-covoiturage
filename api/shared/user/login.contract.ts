import { UserBaseInterface } from './common/interfaces/UserBaseInterface';

export interface ParamsInterface {
  email: string;
  password: string;
}

export interface ResultInterface extends UserBaseInterface {
  _id: string;
  permissions: string[];
}

export const configHandler = {
  service: 'user',
  method: 'login',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
