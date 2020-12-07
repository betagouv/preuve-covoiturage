import { TripSearchInterfaceWithPagination } from './common/interfaces/TripSearchInterface';

export interface ParamsInterface extends TripSearchInterfaceWithPagination {}

export type ResultInterface = { count: string };

export const handlerConfig = {
  service: 'trip',
  method: 'searchcount',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
