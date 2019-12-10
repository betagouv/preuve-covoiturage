import { ApplicationInterface } from './common/interfaces/ApplicationInterface';

export interface ParamsInterface {
  uuid: string;
  owner_id?: string;
  owner_service?: string;
}

export interface ResultInterface extends ApplicationInterface {}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'application',
  method: 'find',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
