import { IdentityInterface } from '../common/interfaces/IdentityInterface';
import { PaymentInterface } from '../common/interfaces/PaymentInterface';
import { GeoPositionInterface } from '../common/interfaces/GeoPositionInterface';

interface PersonMetaInterface {
  payments: PaymentInterface[];
  calc_distance: number;
  calc_duration: number;
}

interface Position extends GeoPositionInterface {
  insee: string;
}

interface PersonInterface {
  is_driver: boolean;
  datetime: Date;
  start: Position;
  end: Position;
  seats: number;
  duration: number;
  distance?: number; // TODO: fix this as nullable :)
  identity: IdentityInterface;
  cost: number; // TODO: add this !
  meta: PersonMetaInterface; // TODO: add this !
}

export interface ParamsInterface {
  operator_trip_id?: string;
  acquisition_id: number; // _id
  operator_id: number;
  operator_journey_id: string; // journey_id  // TODO: add this !
  created_at: Date;
  operator_class: string;
  people: PersonInterface[];
}

export type ResultInterface = void;

export const handlerConfig = {
  service: 'carpool',
  method: 'crosscheck',
};

export const signature = `${handlerConfig.service}:${handlerConfig.method}`;
