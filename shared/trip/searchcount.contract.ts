import { TripSearchInterfaceWithPagination } from './common/interfaces/TripSearchInterface.ts';

export interface ParamsInterface extends TripSearchInterfaceWithPagination {}

export type ResultInterface = { count: string };

export const handlerConfig = {
  service: 'trip',
  method: 'searchcount',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
