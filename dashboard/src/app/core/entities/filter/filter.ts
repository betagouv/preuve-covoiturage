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
  towns: string[];
  distance: {
    min: number;
    max: number;
  };
  ranks: TripRankEnum[];
  status: TripStatusEnum;
  operator_id: number[];
  territory_id: number[];
  constructor(
    obj: FilterInterface = {
      campaign_id: [],
      date: {
        start: null,
        end: null,
      },
      hour: {
        start: null,
        end: null,
      },
      days: [],
      towns: [],
      distance: {
        min: null,
        max: null,
      },
      ranks: [],
      status: null,
      operator_id: [],
      territory_id: [],
    },
  ) {
    this.campaign_id = obj.campaign_id;
    this.date = obj.date;
    this.hour = obj.hour;
    this.days = obj.days;
    this.towns = obj.towns;
    this.distance = obj.distance;
    this.ranks = obj.ranks;
    this.status = obj.status;
    this.operator_id = obj.operator_id;
    this.territory_id = obj.territory_id;
  }
}
