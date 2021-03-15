import { ApplicationInterface } from './common/interfaces/ApplicationInterface';

export interface ParamsInterface {
  uuid: string;
  owner_id?: number;
  owner_service?: string;
}

export interface ResultInterface extends ApplicationInterface {}

export type RepositoryInterface = ParamsInterface;

export const handlerConfig = {
  service: 'application',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
