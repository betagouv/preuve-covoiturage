import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';

import { BehaviorSubject, Observable } from 'rxjs';

import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { LightTrip } from '~/core/entities/trip/trip';
import { ExportFilterUxInterface, ExportFilterInterface } from '~/core/interfaces/filter/exportFilterInterface';
import { GetListStore } from '~/core/services/store/getlist-store';
import { TripApiService } from '~/modules/trip/services/trip-api.service';

@Injectable({
  providedIn: 'root',
})
export class TripStoreService extends GetListStore<LightTrip, LightTrip, TripApiService> {
  protected _total$ = new BehaviorSubject<number>(null);

  constructor(protected tripApi: TripApiService, private _authService: AuthenticationService) {
    super(tripApi);
  }

  get loaded(): boolean {
    return !!this.entitiesSubject.value;
  }

  // total
  get total$(): Observable<number> {
    return this._total$;
  }

  get total(): number {
    return this._total$.value;
  }

  public exportTrips(filter: ExportFilterUxInterface): Observable<any> {
    // map moment to date
    const params: ExportFilterInterface = {
      date: {
        start: moment(filter.date.start).startOf('day').toISOString(),
        end: moment(filter.date.end).endOf('day').toISOString(),
      },
    };

    if (filter.operator_id) {
      params.operator_id = filter.operator_id;
    }

    return this.rpcGetList.exportTrips(params);
  }

  public load(filter: FilterInterface | {} = {}, refreshCount = true): void {
    const params = _.cloneDeep(filter);

    if ('date' in filter && filter.date.start) {
      params['date'].start = filter.date.start.toISOString();
    } else {
      const nowMinus1Year = new Date();
      nowMinus1Year.setMonth(nowMinus1Year.getMonth() - 12);
      nowMinus1Year.setHours(0, 0, 0, 0);
      if (!params['date']) params['date'] = {};
      params['date'].start = nowMinus1Year.toISOString();
    }
    if ('date' in filter && filter.date.end) {
      params['date'].end = filter.date.end.toISOString();
    }

    if (refreshCount) {
      this.rpcGetList.count(params).subscribe((count) => {
        this._total$.next(count);
      });
    }

    this.filterSubject.next(params);
  }

  public upload(file: any): Observable<any> {
    return this.rpcGetList.upload(file);
  }
}
