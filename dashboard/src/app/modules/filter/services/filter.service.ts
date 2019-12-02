// tslint:disable:prefer-conditional-expression
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import * as _ from 'lodash';
import * as moment from 'moment';

import { FilterUxInterface } from '~/core/interfaces/filter/filterUxInterface';
import { Filter } from '~/core/entities/filter/filter';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  public filter$: BehaviorSubject<FilterInterface>;
  public dateFilterInit = {
    start: moment()
      .subtract(1, 'year')
      .toDate(),
    end: moment()
      .subtract(1, 'day')
      .toDate(),
  };

  constructor() {
    this.filter$ = new BehaviorSubject({
      date: this.dateFilterInit,
    });
  }

  // format filterUx to filter in api format
  public setFilter(params: FilterUxInterface): void {
    const filterUx = _.cloneDeep(params);

    let filter;

    // if empty don't set filter
    if (!('campaignIds' in filterUx)) {
      return;
    }

    filter = new Filter({
      date: filterUx.date,
      hour: <any>filterUx.hour,
      days: filterUx.days,
      towns: filterUx.towns,
      distance: filterUx.distance,
      ranks: filterUx.ranks,
      status: filterUx.status,
      territory_id: filterUx.territoryIds,
      operator_id: filterUx.operatorIds,
      campaign_id: filterUx.campaignIds,
    });

    if (!filter.date.start) {
      filter.date.start = this.dateFilterInit.start;
    } else {
      // set start at the beginning of the day and end at the end.
      // DO NOT convert to UTC to avoid days overlapping!
      filter.date.start = `${filter.date.start.toISOString(true).substr(0, 10)}T00:00:00Z`;
    }

    if (!filter.date.end) {
      filter.date.end = this.dateFilterInit.end;
    } else {
      // set start at the beginning of the day and end at the end.
      // DO NOT convert to UTC to avoid days overlapping!
      filter.date.end = `${filter.date.end.toISOString(true).substr(0, 10)}T23:59:59Z`;
    }

    console.log({ filter });

    if (filter.hour.start === null && filter.hour.end === null) {
      delete filter.hour;
    } else {
      // only get hours
      if (filter.hour.start && filter.hour.start.length > 1) {
        filter.hour.start = Number(filter.hour.start.slice(0, 2));
      } else {
        filter.hour.start = 0;
      }

      if (filter.hour.end && filter.hour.end.length > 1) {
        filter.hour.end = Number(filter.hour.end.slice(0, 2));
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
