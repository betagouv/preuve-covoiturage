import { TripSearchInterfaceWithPagination } from './common/interfaces/TripSearchInterface';

export interface ParamsInterface extends TripSearchInterfaceWithPagination {}

interface SingleResultInterface {
  day: Date;
  distance: number;
  carpooles: number;
  trip: number;
  trip_susidized: number;
  operators: number;
};

export type ResultInterface = SingleResultInterface[];

export const handlerConfig = {
  service: 'trip',
  method: 'stats',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
