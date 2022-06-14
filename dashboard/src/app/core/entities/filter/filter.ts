import { WeekDay } from '@angular/common';
import { startOfDay } from 'date-fns';
import { set } from 'lodash-es';

import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { TripStatusEnum } from '~/core/enums/trip/trip-status.enum';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { TerritorySelectorsInterface } from '~/shared/territory/common/interfaces/TerritoryCodeInterface';

export class Filter {
  campaign_id: number[];
  date: {
    start: Date;
    end?: Date;
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
  geo_selector: TerritorySelectorsInterface;

  constructor(obj?: FilterInterface) {
    if (obj) this.map(obj);

    // clean up empty keys
    Object.keys(this).forEach((key) => {
      if (this[key] === null || (Array.isArray(this[key]) && this[key].length === 0)) {
        delete this[key];
      }
    });
  }

  public map(data: any): Filter {
    if (data.campaign_id) this.campaign_id = data.campaign_id;
    if (data.date) {
      this.date = { start: this.castDate(data.date.start) };
      if (data.date.end) this.date.end = this.castDate(data.date.end);
    }
    if (data.hour) this.hour = data.hour;
    if (data.days) this.days = data.days;
    if (data.insee) this.insee = data.insee;
    if (data.distance) {
      if (data.distance.min) set(this, 'distance.min', Number(data.distance.min) * 1000);
      if (data.distance.max) set(this, 'distance.max', Number(data.distance.max) * 1000);
    }
    if (data.ranks) this.ranks = data.ranks;
    if (data.status) this.status = data.status;
    if (data.operator_id) this.operator_id = data.operator_id;
    if (data.geo_selector) this.geo_selector = data.geo_selector;

    return this;
  }

  private castDate(input: any): Date {
    if (!input) return null;
    if ('_isAMomentObject' in input && input._isAMomentObject) return startOfDay(input.toDate());
    return startOfDay(input);
  }
}
