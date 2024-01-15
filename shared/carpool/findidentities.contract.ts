import { IdentityInterface } from '../common/interfaces/IdentityInterface';

export interface ParamsInterface {
  identity: IdentityInterface;
  operator_id?: number;
}

export type ResultInterface = { _id: number; uuid: string }[];

export const handlerConfig = {
  service: 'carpool',
  method: 'findidentities',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
