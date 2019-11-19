import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { finalize, map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { ApiService } from '~/core/services/api/api.service';
import { Trip } from '~/core/entities/trip/trip';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class TripService extends ApiService<Trip> {
  protected _total$ = new BehaviorSubject<number>(null);

  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _authService: AuthenticationService,
  ) {
    super(_http, _jsonRPC, 'trip');
  }

  // total
  get total$(): Observable<number> {
    return this._total$;
  }

  get total(): number {
    return this._total$.value;
  }

  public exportTrips(): Observable<any> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}.export`);
    return this._jsonRPC
      .callOne(jsonRPCParam, {
        headers: new HttpHeaders({
          Accept: 'text/csv',
        }),
        // responseType: 'blob',
      })
      .pipe(
        tap((data) => {
          // TODO
        }),
        finalize(() => {
          // TODO
        }),
      );
  }

  public load(filter: FilterInterface | {} = {}) {
    const params = _.cloneDeep(filter);
    const loggedUser = this._authService.user;
    if (loggedUser && loggedUser.group === UserGroupEnum.TERRITORY) {
      params['territory_id'] = [loggedUser.territory_id];
    }
    if (loggedUser && loggedUser.group === UserGroupEnum.OPERATOR) {
      params['operator_id'] = [loggedUser.operator_id];
    }
    this._listFilters = params;
    this._loading$.next(true);
    return this._jsonRPC.callOne(this.getListJSONParam(params)).pipe(
      tap((data) => {
        this._entities$.next(data.data);
        this._total$.next(data.meta['pagination']['total']);
        this._loaded$.next(true);
      }),
      map((data) => data.data),
      finalize(() => {
        this._loading$.next(false);
      }),
    );
  }

  // todo: uncomment when api route is made
  // public downloadModel(): Observable<any> {
  //   const jsonRPCParam = new JsonRPCParam(`${this._method}.importModel`);
  //   return this._jsonRPC.call(jsonRPCParam, {
  //     headers: new HttpHeaders({
  //       Accept: 'text/csv',
  //     }),
  //     responseType: 'blob',
  //   });
  // }

  public upload(file: any): Observable<any> {
    const jsonRPCParam = new JsonRPCParam(`acquisition.import`, { csv: file });
    return this._jsonRPC.callOne(jsonRPCParam, {
      reportProgress: true,
      // TODO: Gilles investigate specific post option paramters
      // observe: 'events',
    });
  }
}
