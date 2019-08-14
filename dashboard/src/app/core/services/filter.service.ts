import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FilterInterface, FilterViewInterface } from '~/core/interfaces/filter/filterInterface';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  public _filter$: BehaviorSubject<FilterInterface> = new BehaviorSubject<FilterInterface>({});

  constructor() {}

  public formatDataForApi(data: FilterViewInterface): FilterInterface {
    const filter: FilterInterface = {};
    if (data.campaign) {
      _.set(filter, 'filter["campaigns._id"]', data.campaign._id);
    }
    if (data.startDate) {
      _.set(filter, "filter['people.start.date'].$gte", data.startDate);
    }
    if (data.endDate) {
      _.set(filter, "filter['people.end.date'].$lt", data.endDate);
    }
    if (data.startTime) {
      _.set(filter, 'hours.start', data.startTime);
    }
    if (data.endTime) {
      _.set(filter, 'hours.end', data.endTime);
    }
    if (data.days) {
      _.set(filter, 'filter.days', data.days);
    }
    if (data.towns) {
      _.set(filter, 'filter["people.town"].$in', data.towns);
    }
    if (data.minDistance) {
      _.set(filter, 'filter["people.distance"].$gte', data.minDistance);
    }
    if (data.maxDistance) {
      _.set(filter, 'filter["people.distance"].$lt', data.maxDistance);
    }
    if (data.classes) {
      _.set(filter, 'filter["people.class"].$in', data.classes);
    }
    if (data.status) {
      _.set(filter, 'filter.status', data.status);
    }
    if (data.operators) {
      _.set(filter, 'filter["people.operator._id"].$in', data.operators);
    }
    return filter;
  }

  public setFilter(filter: FilterViewInterface): void {
    this._filter$.next(this.formatDataForApi(filter));
  }
}
