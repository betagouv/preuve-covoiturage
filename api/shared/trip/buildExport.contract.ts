import { TripSearchInterface } from './common/interfaces/TripSearchInterface';

export interface ParamsInterface {
  query: {
    date: {
      start: Date;
      end: Date;
    };
    operator_territory_id?: number; // territory id for operator visibility filtering
    operator_id?: number[];
    territory_id?: number[];
  };
  from: {
    email: string;
    fullname: string;
  };
}
export type ResultInterface = void;

export const handlerConfig = {
  service: 'trip',
  method: 'buildExport',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
