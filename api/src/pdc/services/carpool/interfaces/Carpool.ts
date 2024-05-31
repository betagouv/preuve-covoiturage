import { PaymentInterface } from '@shared/common/interfaces/PaymentInterface.ts';
import { GeoPositionInterface } from '@shared/common/interfaces/GeoPositionInterface.ts';

export { IdentityInterface } from '@shared/common/interfaces/IdentityInterface.ts';
export { IncentiveInterface } from '@shared/common/interfaces/IncentiveInterface.ts';

export interface PeopleMetaInterface {
  payments: PaymentInterface[];
  calc_distance: number;
  calc_duration: number;
}

export interface PositionInterface extends GeoPositionInterface {
  geo_code: string;
}

export interface PeopleInterface {
  is_driver: boolean;
  datetime: Date;
  start: PositionInterface;
  end: PositionInterface;
  seats: number;
  duration: number;
  distance?: number;
  cost: number;
  meta: PeopleMetaInterface;
  payment: number;
}

export interface PeopleWithIdInterface extends PeopleInterface {
  identity_id: number;
}
