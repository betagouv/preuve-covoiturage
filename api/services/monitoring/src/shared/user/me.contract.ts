import { UserInterface } from './common/interfaces/UserInterface';

export type ParamsInterface = void;

export interface ResultInterface extends UserInterface {}

export const handlerConfig = {
  service: 'user',
  method: 'me',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
