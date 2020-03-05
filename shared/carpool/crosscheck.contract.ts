import { FinalizedPersonInterface } from '../common/interfaces/PersonInterface';

export interface ParamsInterface {
  operator_trip_id?: string;
  acquisition_id: number;
  operator_id: number;
  operator_journey_id: string;
  created_at: Date;
  operator_class: string;
  people: FinalizedPersonInterface[];
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'carpool',
  method: 'crosscheck',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
