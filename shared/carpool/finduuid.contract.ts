import { IdentityInterface } from '../common/interfaces/IdentityInterface';

export interface ParamsInterface {
  identity: IdentityInterface;
  operator_id?: number;
}

export type ResultInterface = string;

export const handlerConfig = {
  service: 'carpool',
  method: 'finduuid',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
