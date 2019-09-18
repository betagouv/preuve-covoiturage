import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { FilterInterface, FilterUxInterface } from '~/core/interfaces/filter/filterUxInterface';
import { Filter } from '~/core/entities/filter/filter';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  public _filter$ = new BehaviorSubject<FilterInterface | {}>({});

  constructor() {}

  public setFilter(filterUx: FilterUxInterface | {} = {}): void {
    // format filterUx to filter in api format
    let filter;

    console.log({ filterUx });

    if ('campaignIds' in filterUx) {
      filter = new Filter({
        date: filterUx.date,
        hour: filterUx.hour,
        days: filterUx.days,
        towns: filterUx.towns,
        distance: filterUx.distance,
        ranks: filterUx.ranks,
        status: filterUx.status,
        territory_id: filterUx.territoryIds,
        operator_id: filterUx.operatorIds,
        campaign_id: filterUx.campaignIds,
      });

      // only get hours
      if (filter.hour.start.length > 1) {
        filter.hour.start = filter.hour.start.slice(0, 2);
      }
      if (filter.hour.end.length > 1) {
        filter.hour.end = filter.hour.end.slice(0, 2);
      }
    }

    console.log({ filter });

    this._filter$.next(filter);
  }
}
