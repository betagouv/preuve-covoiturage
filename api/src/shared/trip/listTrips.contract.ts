import { ResultWithPagination } from '../common/interfaces/ResultWithPagination.ts';
import { LightTripInterface } from './common/interfaces/LightTripInterface.ts';
import { TripSearchInterfaceWithPagination } from './common/interfaces/TripSearchInterface.ts';

export interface ParamsInterface extends TripSearchInterfaceWithPagination {}

export type ResultInterface = ResultWithPagination<LightTripInterface>;

export const handlerConfig = {
  service: 'trip',
  method: 'list',
} as const;

export const signature = `${handlerConfig.service}:${handlerConfig.method}` as const;
