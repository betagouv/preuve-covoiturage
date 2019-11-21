// tslint:disable:variable-name
import { TripStatusEnum } from '../../enums/trip/trip-status.enum';

export interface LightTripInterface {
  trip_id: number;
  is_driver: boolean;
  start_town?: string;
  end_town?: string;
  start_datetime: Date;
  operator_id: number;
  incentives: LightTripIncentives[];
  operator_class: string;
  campaigns_id: number[];
  status: TripStatusEnum;
}

export interface LightTripIncentives {
  amount: number;
  siret: string;
}
