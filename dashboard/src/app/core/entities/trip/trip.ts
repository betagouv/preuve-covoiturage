import { LightTripIncentives, LightTripInterface } from '~/core/interfaces/trip/tripInterface';

// tslint:disable:variable-name
import { TripStatusEnum } from '../../enums/trip/trip-status.enum';

export class LightTrip {
  public status: TripStatusEnum;
  public trip_id: number;
  public is_driver: boolean;
  public start_town: string;
  public start_datetime: Date;
  public operator_class: string;
  public operator_id: number;
  public end_town: string;
  incentives: LightTripIncentives[];
  public campaigns_id: number[];

  constructor(obj?: LightTripInterface) {
    this.status = (obj && obj.status) || null;
    this.trip_id = (obj && obj.trip_id) || null;
    this.is_driver = (obj && obj.is_driver) || null;
    this.start_town = (obj && obj.start_town) || null;
    this.start_datetime = (obj && obj.start_datetime) || null;
    this.operator_class = (obj && obj.operator_class) || null;
    this.operator_id = (obj && obj.operator_id) || null;
    this.end_town = (obj && obj.end_town) || null;
    this.incentives = (obj && obj.incentives) || [];
    this.campaigns_id = (obj && obj.campaigns_id) || [];
  }
}
