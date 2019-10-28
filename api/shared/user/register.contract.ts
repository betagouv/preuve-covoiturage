import { UserBaseInterface } from './common/interfaces/UserBaseInterface';

export interface ParamsInterface extends UserBaseInterface {
  password: string;
}

export interface ResultInterface extends UserBaseInterface {
  _id: string;
  permissions: string[];
  created_at: Date;
}

export const configHandler = {
  service: 'user',
  method: 'register',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
