import { UserInterface } from './common/interfaces/UserInterface';

export type ParamsInterface = void;

export interface ResultInterface extends UserInterface {}

export const configHandler = {
  service: 'user',
  method: 'me',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
