import { CompanyInterface } from '../common/interfaces/CompanyInterface2.ts';

export type ParamsInterface = string;

export type ResultInterface = CompanyInterface;

export const handlerConfig = {
  service: 'company',
  method: 'fetch',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
