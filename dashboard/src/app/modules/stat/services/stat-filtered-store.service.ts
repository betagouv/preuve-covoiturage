import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { cloneDeep } from 'lodash-es';

import { FormatedStatsInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { StatFormatService } from '~/modules/stat/services/stat-format.service';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { StatApiService } from '~/modules/stat/services/stat-api.service';
import { GetListStore } from '~/core/services/store/getlist-store';
import { TripSearchInterface } from '~/core/entities/api/shared/trip/common/interfaces/TripSearchInterface';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';
import { ApiGraphTimeMode } from './ApiGraphTimeMode';

@Injectable({
  providedIn: 'root',
})
export class StatFilteredStoreService extends GetListStore<StatInterface> {
  private _formatedStat$ = new BehaviorSubject<FormatedStatsInterface>(null);
  protected _timeMode: BehaviorSubject<ApiGraphTimeMode>;

  constructor(statApi: StatApiService, private _statFormatService: StatFormatService) {
    super(statApi as JsonRpcGetList<StatInterface, StatInterface, any, TripSearchInterface>);
    this.entitiesSubject.subscribe((data) => {
      this._formatedStat$.next(this._statFormatService.formatData(data));
    });
  }

  public load(filter: FilterInterface | {} = {}): void {
    const params = cloneDeep(filter);

    if ('date' in filter && filter.date.start) {
      params['date'].start = filter.date.start.toISOString();
    }
    if ('date' in filter && filter.date.end) {
      params['date'].end = filter.date.end.toISOString();
    }

    this._filterSubject.next(params);
  }

  get stat(): FormatedStatsInterface {
    return this._formatedStat$.value;
  }

  get stat$(): Observable<FormatedStatsInterface> {
    return this._formatedStat$;
  }

  get timeModeSubject(): BehaviorSubject<ApiGraphTimeMode> {
    return this._timeMode;
  }

  init(): void {
    this._formatedStat$.next(null);
  }

  // override filter behaviour un order to implemented DateMode input flow

  protected _setupFilterSubject() {
    let firstLoad = true;

    this._timeMode = new BehaviorSubject<ApiGraphTimeMode>(ApiGraphTimeMode.Month);

    merge(this._filterSubject, this._timeMode).subscribe((filt) => {
      if (firstLoad || filt !== null) {
        this.loadList();
        firstLoad = !firstLoad || !!filt;
      }
    });
  }

  get finalFilterValue(): any {
    return { ...this.filterSubject.value, group_by: this._timeMode.value };
  }
}
