import { Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';

import { finalize, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _authService: AuthenticationService,
  ) {
    super(_http, _jsonRPC, 'trip');
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
    const loggedUser = this._authService.user;
    if (loggedUser && loggedUser.group === UserGroupEnum.TERRITORY) {
      filter['territory_id'] = [loggedUser.territory];
      // TODO: temp, remove when filter operator added
      if ('operator_id' in filter) {
        delete filter.operator_id;
      }
    }
    if (loggedUser && loggedUser.group === UserGroupEnum.OPERATOR) {
      filter['operator_id'] = [loggedUser.operator];
    }
    return super.load(filter);
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
