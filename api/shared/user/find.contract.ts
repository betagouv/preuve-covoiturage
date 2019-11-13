import { UserInterface } from './common/interfaces/UserInterface';

export interface ParamsInterface {
  _id: number;
}

export interface ResultInterface extends UserInterface {}

export const configHandler = {
  service: 'user',
  method: 'find',
};

export const signature = `${configHandler.service}:${configHandler.method}`;
