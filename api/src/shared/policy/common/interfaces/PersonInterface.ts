import { TerritoryCodeInterface } from '../../../territory/common/interfaces/TerritoryCodeInterface.ts';

export interface PersonInterface {
  identity_uuid: string;
  carpool_id: number;
  trip_id: string;
  operator_id: number;
  operator_class: string;
  is_over_18: boolean | null;
  is_driver: boolean;
  has_travel_pass: boolean;
  datetime: Date;
  seats: number;
  duration: number;
  distance: number;
  cost: number;
  start: TerritoryCodeInterface;
  end: TerritoryCodeInterface;
}
