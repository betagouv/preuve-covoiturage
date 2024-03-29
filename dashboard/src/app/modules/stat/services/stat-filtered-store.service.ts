import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
import { catchError, debounceTime, mergeMap } from 'rxjs/operators';
import { TripSearchInterface } from '~/core/entities/api/shared/trip/common/interfaces/TripSearchInterface';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { FormatedStatsInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';
import { GetListStore } from '~/core/services/store/getlist-store';
import { StatApiService } from '~/modules/stat/services/stat-api.service';
import { ApiGraphTimeMode } from './ApiGraphTimeMode';

@Injectable({
  providedIn: 'root',
})
export class StatFilteredStoreService extends GetListStore<StatInterface> {
  private _formatedStat$ = new BehaviorSubject<FormatedStatsInterface>(null);
  protected _timeMode: BehaviorSubject<ApiGraphTimeMode>;
  protected _totalStats = new BehaviorSubject<StatInterface>(null);
  private _currentFilterSignature: string;

  constructor(statApi: StatApiService) {
    super(statApi as JsonRpcGetList<StatInterface, StatInterface, any, TripSearchInterface>);
  }

  public updateFilterSubject(filter: FilterInterface | {} = {}): void {
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

  get totalStats$(): Observable<StatInterface> {
    return this._totalStats.asObservable();
  }

  get timeModeSubject(): BehaviorSubject<ApiGraphTimeMode> {
    return this._timeMode;
  }

  init(): void {
    this._formatedStat$.next(null);

    this._currentFilterSignature = this.filterSignature;
  }

  // override filter behaviour un order to implemented DateMode input flow
  get filterSignature(): string {
    return JSON.stringify({
      filterSubject: this._filterSubject.value,
      timeMode: this._timeMode.value,
    });
  }

  protected _setupFilterSubject() {
    let firstLoad = true;

    this._timeMode = new BehaviorSubject<ApiGraphTimeMode>(ApiGraphTimeMode.Month);

    // Wath for changes on filters and timeMode
    merge(this._filterSubject, this._timeMode)
      .pipe(debounceTime(50))
      .subscribe((filter) => {
        if (firstLoad || filter !== null) {
          // use signature cache with filters data in order to resubmit stats filter
          const currentSignature = this.filterSignature;
          if (this.hasFilterSignatureChanged(currentSignature)) {
            this._currentFilterSignature = currentSignature;
            this.loadList();
            firstLoad = !firstLoad || !!filter;
          } else {
            setTimeout(() => this.entitiesSubject.next(this.entitiesSubject.value), 0);
          }
        }
      });

    // Watch for changes on filters only
    this._filterSubject
      .pipe(
        debounceTime(50),
        mergeMap((filter) => this.callTotalStats(filter)),
      )
      .subscribe((totalStats) => {
        this._totalStats.next(totalStats);
      });
  }

  private callTotalStats(filter): Observable<StatInterface> {
    const totalStatsObservable: Observable<StatInterface> = (this.rpcGetList as StatApiService).getTotalStats(filter);
    // return null value if any server error to avoid breaking the subject
    return totalStatsObservable.pipe(catchError((err) => of(null)));
  }

  private hasFilterSignatureChanged(currentSignature: string): Boolean {
    return this._currentFilterSignature !== currentSignature;
  }

  get finalFilterValue(): any {
    return { ...this.filterSubject.value, group_by: this._timeMode.value };
  }
}
