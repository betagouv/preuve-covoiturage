import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { ExportFilterInterface } from '~/core/interfaces/filter/exportFilterInterface';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';
import { JsonRPCResult } from '~/core/entities/api/jsonRPCResult';
import { LightTrip } from '~/core/entities/trip/trip';
// tslint:disable-next-line:max-line-length
import { TripSearchInterfaceWithPagination } from '~/core/entities/api/shared/trip/common/interfaces/TripSearchInterface';
import { ResultInterface as TripSearchResultInterface } from '~/core/entities/api/shared/trip/list.contract';

@Injectable({
  providedIn: 'root',
})
export class TripApiService extends JsonRpcGetList<LightTrip, LightTrip, any, TripSearchInterfaceWithPagination> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'trip');
  }

  exportTrips(params: ExportFilterInterface): Observable<any> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:export`, params);
    return this.callOne(jsonRPCParam);
  }

  getTrips(params?: TripSearchInterfaceWithPagination): Observable<TripSearchResultInterface> {
    return this.callOne(this.paramGetList(params)).pipe(map((data) => data));
  }

  upload(file: any): Observable<any> {
    const jsonRPCParam = new JsonRPCParam(`acquisition.import`, { csv: file });
    return this.callOne(jsonRPCParam, {
      reportProgress: true,
      // TODO: Gilles investigate specific post option paramters
      // observe: 'events',
    });
  }

  // public upload(file: any): Observable<any> {
  //   const jsonRPCParam = new JsonRPCParam(`acquisition.import`, { csv: file });
  //   return this._jsonRPC.callOne(jsonRPCParam, {
  //     reportProgress: true,
  //     // TODO: Gilles investigate specific post option paramters
  //     // observe: 'events',
  //   });
  // }
}
