// tslint:disable:variable-name
import { WeekDay } from '@angular/common';

import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';

export class Filter {
  campaign_id: number[];
  date: {
    start: Date;
    end: Date;
  };
  hour: {
    start: number;
    end: number;
  };
  days: WeekDay[];
  insee: string[];
  distance: {
    min: number;
    max: number;
  };
  ranks: TripRankEnum[];
  status: TripStatusEnum;
  operator_id: number[];
  territory_id: number[];
  constructor(obj?: FilterInterface) {
    if (obj) this.map(obj);
  }

  map(data: any): Filter {
    if (data.campaign_id) this.campaign_id = data.campaign_id;
    if (data.date) this.date = data.date;
    if (data.hour) this.hour = data.hour;
    if (data.days) this.days = data.days;
    if (data.insee) this.insee = data.insee;
    if (data.distance) this.distance = data.distance;
    if (data.ranks) this.ranks = data.ranks;
    if (data.status) this.status = data.status;
    if (data.operator_id) this.operator_id = data.operator_id;
    if (data.territory_id) this.territory_id = data.territory_id;
    return this;
  }
}
