import { TripSearchInterfaceWithPagination } from './common/interfaces/TripSearchInterface';

export interface ParamsInterface extends TripSearchInterfaceWithPagination {}

export type ResultInterface = { count: number };

export const handlerConfig = {
  service: 'trip',
  method: 'searchcount',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
