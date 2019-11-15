// tslint:disable:variable-name
import { TripStatusEnum } from '../../enums/trip/trip-status.enum';
import { TripInterface } from '../../interfaces/trip/tripInterface';

export class Trip {
  public _id: number; // todo: delete this eventualy
  public status: TripStatusEnum;
  public trip_id: number;
  public start_town: string;
  public start_datetime: string;
  public operator_class: string;
  public operator_id: number;
  public end_town: string;
  public incentives: [];
  public campaigns_id: number[];

  constructor(obj: TripInterface) {
    this.status = obj.status;
    this.trip_id = obj.trip_id;
    this.start_town = obj.start_town;
    this.start_datetime = obj.start_datetime;
    this.operator_class = obj.operator_class;
    this.operator_id = obj.operator_id;
    this.end_town = obj.end_town;
    this.incentives = obj.incentives;
    this.campaigns_id = obj.campaigns_id;
  }
}
