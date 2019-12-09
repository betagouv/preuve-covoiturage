import { TripSearchInterfaceWithPagination } from './common/interfaces/TripSearchInterface';
import { ResultWithPagination } from '../common/interfaces/ResultWithPagination';

export interface ParamsInterface extends TripSearchInterfaceWithPagination {}
interface SingleResultInterface {
  trip_id: string;
  start_town?: string;
  end_town?: string;
  start_datetime: Date;
  operator_id: string;
  incentives: number;
  operator_class: string;
}

export type ResultInterface = ResultWithPagination<SingleResultInterface>;

export const handlerConfig = {
  service: 'trip',
  method: 'list',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
