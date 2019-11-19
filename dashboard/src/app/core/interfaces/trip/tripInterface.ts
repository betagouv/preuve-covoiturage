import { Trip } from '~/core/entities/trip/trip';

// tslint:disable:variable-name
import { TripStatusEnum } from '../../enums/trip/trip-status.enum';

export interface TripInterface {
  status: TripStatusEnum;
  trip_id: number;
  start_town: string;
  start_datetime: string;
  operator_class: string;
  operator_id: number;
  end_town: string;
  incentives: [];
  campaigns_id: number[];
}
