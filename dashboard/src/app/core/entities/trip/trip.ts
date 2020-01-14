// tslint:disable:variable-name
import { BaseModel } from '~/core/entities/BaseModel';

import { SingleResultInterface as LightTripInterface } from '~/core/entities/api/shared/trip/list.contract';

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
  incentives: number;
  public campaigns_id: number[];

  constructor(obj?: LightTripInterface) {
    if (obj) this.map(obj);
  }

  map(data: any): LightTrip {
    this.status = (data && data.status) || null;
    this.trip_id = (data && data.trip_id) || null;
    this.is_driver = (data && data.is_driver) || null;
    this.start_town = (data && data.start_town) || null;
    this.start_datetime = (data && data.start_datetime) || null;
    this.operator_class = (data && data.operator_class) || null;
    this.operator_id = (data && data.operator_id) || null;
    this.end_town = (data && data.end_town) || null;
    this.incentives = (data && data.incentives) || [];
    this.campaigns_id = (data && data.campaigns_id) || [];
    return this;
  }
}
