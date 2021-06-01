// tslint:disable:no-bitwise
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

import { FormatedStatsInterface } from '~/core/interfaces/stat/formatedStatInterface';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { PublicTripSearchInterface } from '../../../core/entities/api/shared/trip/common/interfaces/TripSearchInterface';

@Injectable({
  providedIn: 'root',
})
export class StatPublicService {
  private _formatedStat$ = new BehaviorSubject<FormatedStatsInterface>(null);
  private _loaded$ = new BehaviorSubject<boolean>(false);
  private _loading$ = new BehaviorSubject<boolean>(false);

  constructor(private _http: HttpClient) {}

  public loadOne(params: PublicTripSearchInterface): Observable<StatInterface[]> {
    this._loading$.next(true);

    return this._http.post('stats', params).pipe(tap((data: StatInterface[]) => {}));
  }

  get loading(): boolean {
    return this._loading$.value;
  }

  get loaded(): boolean {
    return this._loaded$.value;
  }

  get stat(): FormatedStatsInterface {
    return this._formatedStat$.value;
  }

  get stat$(): Observable<FormatedStatsInterface> {
    return this._formatedStat$;
  }
}
