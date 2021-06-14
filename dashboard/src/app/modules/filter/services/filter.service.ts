import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { cloneDeep } from 'lodash-es';

import { FilterUxInterface } from '~/core/interfaces/filter/filterUxInterface';
import { Filter } from '~/core/entities/filter/filter';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  public filter$ = new BehaviorSubject<FilterInterface | {}>({});

  constructor() {}

  public resetFilter(): void {
    this.filter$.next({});
  }

  // format filterUx to filter in api format
  public setFilter(params: Partial<FilterUxInterface> = {}): void {
    const filterUx = cloneDeep(params);

    // if empty don't set filter
    if (!('campaignIds' in filterUx)) {
      return this.resetFilter();
    }

    return this.filter$.next(
      new Filter({
        date: filterUx.date,
        days: filterUx.days,
        distance: filterUx.distance,
        ranks: filterUx.ranks,
        status: filterUx.status,
        territory_id: filterUx.territoryIds,
        operator_id: filterUx.operatorIds,
        campaign_id: filterUx.campaignIds,
      }),
    );
  }
}
