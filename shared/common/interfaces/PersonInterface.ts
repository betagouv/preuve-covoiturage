import { PositionInterface } from './PositionInterface';
import { IdentityInterface } from './IdentityInterface';
import { PaymentInterface } from './PaymentInterface';
import { IncentiveInterface } from './IncentiveInterface';
import { GeoPositionInterface } from './GeoPositionInterface';

export interface PersonInterface {
  is_driver?: boolean;
  identity: IdentityInterface;
  operator_class?: string;
  journey_id?: string;
  operator_id?: number;

  start: PositionInterface;
  end: PositionInterface;
  distance?: number;
  duration?: number;

  seats?: number;
  contribution?: number;
  revenue?: number;
  expense?: number;
  incentives?: IncentiveInterface[];

  payments?: PaymentInterface[];

  calc_distance?: number;
  calc_duration?: number;
  cost?: number;
  payment?: number;
}

export interface FinalizePositionInterface extends GeoPositionInterface {
  geo_code: string;
}

export interface FinalizedPersonInterface {
  is_driver: boolean;
  identity: IdentityInterface;
  datetime: Date;
  start: FinalizePositionInterface;
  end: FinalizePositionInterface;
  seats: number;
  distance: number;
  duration: number;
  cost: number;
  payment: number;
  meta: PersonMetaInterface;
}

enum Target {
  Driver = 'driver',
  Passenger = 'passenger',
}

export interface PersonMetaInterface {
  payments: PaymentInterface[];
  calc_distance: number;
  calc_duration: number;
  licence_plate?: string;
}
