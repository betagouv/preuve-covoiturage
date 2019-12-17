import { ApplicationInterface } from './common/interfaces/ApplicationInterface';

export interface ParamsInterface {
  name: string;
  owner_id?: number;
  owner_service?: string;
  permissions?: string[];
}

export interface ResultInterface extends ApplicationInterface {}

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'application',
  method: 'create',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
