import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { finalize, map, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { FilterInterface } from '~/core/interfaces/filter/filterInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { LightTripInterface } from '~/core/interfaces/trip/tripInterface';
import { LightTrip } from '~/core/entities/trip/trip';
import { ExportFilterInterface, ExportFilterUxInterface } from '~/core/interfaces/filter/exportFilterInterface';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  protected _total$ = new BehaviorSubject<number>(null);
  private _method = 'trip';
  protected _listFilters = {};

  protected _loading$ = new BehaviorSubject<boolean>(false);
  protected _loaded$ = new BehaviorSubject<boolean>(false);

  protected _entities$ = new BehaviorSubject<LightTripInterface[]>([]);

  get loading(): boolean {
    return this._loading$.value;
  }

  get loaded(): boolean {
    return this._loaded$.value;
  }

  public getListJSONParam(parameters: object = {}): JsonRPCParam {
    return new JsonRPCParam(`${this._method}:list`, parameters);
  }

  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _authService: AuthenticationService,
  ) {}

  // total
  get total$(): Observable<number> {
    return this._total$;
  }

  get total(): number {
    return this._total$.value;
  }

  public exportTrips(filter: ExportFilterUxInterface): Observable<any> {
    // map moment to date
    const params = {
      date: {
        start: moment(filter.date.start).toDate(),
        end: moment(filter.date.end).toDate(),
      },
    };
    const jsonRPCParam = new JsonRPCParam(`${this._method}:export`, params);
    return this._jsonRPC.callOne(jsonRPCParam);
  }

  public load(filter: FilterInterface | {} = {}): Observable<LightTripInterface[]> {
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
        this._total$.next(data.meta['pagination']['total']);
        this._loaded$.next(true);
      }),
      map((data) => data.data.map((trip) => new LightTrip(trip))),
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
