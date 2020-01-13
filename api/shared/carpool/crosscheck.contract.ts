import { IdentityInterface } from '../common/interfaces/IdentityInterface';
import { PaymentInterface } from '../common/interfaces/PaymentInterface';
import { GeoPositionInterface } from '../common/interfaces/GeoPositionInterface';
import { FinalizedPersonInterface } from '../common/interfaces/PersonInterface';

export interface ParamsInterface {
  operator_trip_id?: string;
  acquisition_id: number; // _id
  operator_id: number;
  operator_journey_id: string; // journey_id  // TODO: add this !
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
