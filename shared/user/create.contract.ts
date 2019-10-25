import { UserBaseInterface } from './common/interfaces/UserBaseInterface';
import { UserInterface } from './common/interfaces/UserInterface';

export interface ParamsInterface extends UserBaseInterface {}

export type ResultInterface = UserInterface;

export const configHandler = {
  service: 'user',
  method: 'create',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
