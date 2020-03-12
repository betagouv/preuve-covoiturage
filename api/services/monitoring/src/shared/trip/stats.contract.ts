import { TripSearchInterface } from './common/interfaces/TripSearchInterface';

export interface ParamsInterface extends TripSearchInterface {}

export interface SingleResultInterface {
  day: Date;
  distance: number;
  carpoolers: number;
  trip: number;
  trip_subsidized: number;
  operators: number;
}

export type ResultInterface = SingleResultInterface[];

export const handlerConfig = {
  service: 'trip',
  method: 'stats',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
