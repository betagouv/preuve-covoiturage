export { IdentityInterface } from '../shared/common/interfaces/IdentityInterface';
import { PaymentInterface } from '../shared/common/interfaces/PaymentInterface';
import { GeoPositionInterface } from '../shared/common/interfaces/GeoPositionInterface';

export interface PeopleMetaInterface {
  payments: PaymentInterface[];
  calc_distance: number;
  calc_duration: number;
}

export interface PositionInterface extends GeoPositionInterface {
  insee: string;
}

export interface PeopleInterface {
  is_driver: boolean;
  datetime: Date;
  start: PositionInterface;
  end: PositionInterface;
  seats: number;
  duration: number;
  distance?: number; // TODO: fix this as nullable :)
  cost: number;     // TODO: add this ! 
  meta: PeopleMetaInterface; // TODO: add this !
}

export interface PeopleWithIdInterface extends PeopleInterface {
  identity_id: number;
}
