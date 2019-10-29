import { TripSearchInterface } from './common/interfaces/TripSearchInterface';

export interface ParamsInterface extends TripSearchInterface {}
export type ResultInterface = any;

export const handlerConfig = {
  service: 'trip',
  method: 'stats',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
