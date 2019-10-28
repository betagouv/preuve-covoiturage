import { UserIdInterface } from './common/interfaces/UserIdInterface';

export interface ParamsInterface {
  _id: string;
  role: string;
}

export type ResultInterface = UserIdInterface;

export const configHandler = {
  service: 'user',
  method: 'changeRole',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
