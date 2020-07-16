import { CompanyInterface } from '../common/interfaces/CompanyInterface2';

export type ParamsInterface = string;

export type ResultInterface = CompanyInterface;

export const handlerConfig = {
  service: 'company',
  method: 'fetch',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
