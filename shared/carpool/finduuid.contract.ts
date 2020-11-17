import { IdentityInterface } from '../common/interfaces/IdentityInterface';

export interface ParamsInterface {
  identity: IdentityInterface;
  operator_id?: number;
}

export type ResultInterface = string;

export const handlerConfig = {
  service: 'carpool',
  method: 'finduuid',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
