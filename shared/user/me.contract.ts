import { UserBaseInterface } from './common/interfaces/UserBaseInterface';

interface User extends UserBaseInterface {
  _id: string;
  permissions: string[];
}

export type ParamsInterface = void;

export interface ResultInterface extends User {}

export const configHandler = {
  service: 'user',
  method: 'me',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
