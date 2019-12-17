import { ApplicationInterface } from './common/interfaces/ApplicationInterface';

export interface ParamsInterface {
  owner_id?: number;
  owner_service?: string;
}

export type ResultInterface = ApplicationInterface[];

export type RepositoryInterface = Required<ParamsInterface>;

export const handlerConfig = {
  service: 'application',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
