import { TripSearchInterfaceWithPagination } from './common/interfaces/TripSearchInterface';
import { ResultWithPagination } from '../common/interfaces/ResultWithPagination';
import { LightTripInterface } from './common/interfaces/LightTripInterface';

export interface ParamsInterface extends TripSearchInterfaceWithPagination {}

export type ResultInterface = ResultWithPagination<LightTripInterface>;

export const handlerConfig = {
  service: 'trip',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
