// tslint:disable:prefer-conditional-expression
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as _ from 'lodash';
import * as moment from 'moment';

import { FilterUxInterface } from '~/core/interfaces/filter/filterUxInterface';
import { Filter } from '~/core/entities/filter/filter';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  public filter$ = new BehaviorSubject<FilterInterface | {}>({});

  constructor() {}

  // format filterUx to filter in api format
  public setFilter(params: FilterUxInterface | {} = {}): void {
    const filterUx = _.cloneDeep(params);

    // if empty don't set filter
    if (!('campaignIds' in filterUx)) {
      return;
    }

    const filter = new Filter({
      date: filterUx.date,
      hour: filterUx.hour as any,
      days: filterUx.days,
      distance: filterUx.distance,
      ranks: filterUx.ranks,
      status: filterUx.status,
      territory_id: filterUx.territoryIds,
      operator_id: filterUx.operatorIds,
      campaign_id: filterUx.campaignIds,
    });

    if (filter.date.start === null && filter.date.end === null) {
      delete filter.date;
    } else {
      // set start at the beginning of the day and end at the end.
      if (filter.date.start) filter.date.start = (filter.date.start as any).startOf('day').toDate();
      if (filter.date.end) filter.date.end = (filter.date.end as any).endOf('day').toDate();
    }

    if (filter.hour.start === null && filter.hour.end === null) {
      delete filter.hour;
    } else {
      // time zone hacky fix until ddb has timezones
      if (filter.hour.start) {
        filter.hour.start = moment().hours(filter.hour.start).utc().hours();
      } else {
        filter.hour.start = 0;
      }

      if (filter.hour.end) {
        // time zone hacky fix until ddb has timezones
        filter.hour.end = moment().hours(filter.hour.end).utc().hours();
      } else {
        filter.hour.end = 23;
      }
    }

    // format distance to Number
    if (filter.distance.min) {
      // to meters
      filter.distance.min = Number(filter.distance.min) * 1000;
    } else {
      delete filter.distance.min;
    }
    if (filter.distance.max) {
      // to meters
      filter.distance.max = Number(filter.distance.max) * 1000;
    } else {
      delete filter.distance.max;
    }

    // delete distance key if object is empty
    if (Object.keys(filter.distance).length === 0) {
      delete filter.distance;
    }

    // remove empty arrays & null values
    Object.keys(filter).forEach((key) => {
      if (filter[key] === null || (Array.isArray(filter[key]) && filter[key].length === 0)) {
        delete filter[key];
      }
    });

    this.filter$.next(filter);
  }
}
