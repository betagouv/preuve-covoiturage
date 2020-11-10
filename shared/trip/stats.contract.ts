import { TripSearchInterface } from './common/interfaces/TripSearchInterface';

export interface ParamsInterface extends TripSearchInterface {}

export interface SingleResultInterface {
  day: Date;
  distance: number;
  carpoolers: number;
  trip: number;
  average_carpoolers_by_car: number;
  trip_subsidized: number;
  operators: number;
}

export type ResultInterface = SingleResultInterface[];

export const handlerConfig = {
  service: 'trip',
  method: 'stats',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
