import { CreateTerritoryGroupInterface, TerritoryGroupInterface } from './common/interfaces/TerritoryInterface.ts';

export interface ParamsInterface extends CreateTerritoryGroupInterface {}

export interface ResultInterface extends TerritoryGroupInterface {}

export const handlerConfig = {
  service: 'territory',
  method: 'create',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
