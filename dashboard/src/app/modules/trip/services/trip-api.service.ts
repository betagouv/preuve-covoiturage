import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { endOfDay, startOfDay } from 'date-fns';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseParamsInterface as TripExportParamsInterface } from 'shared/trip/export.contract';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
// eslint-disable-next-line
import { TripSearchInterfaceWithPagination } from '~/core/entities/api/shared/trip/common/interfaces/TripSearchInterface';
import { ResultInterface as TripSearchResultInterface } from '~/core/entities/api/shared/trip/list.contract';
import { LightTrip } from '~/core/entities/trip/trip';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';

@Injectable({
  providedIn: 'root',
})
export class TripApiService extends JsonRpcGetList<LightTrip, LightTrip, any, TripSearchInterfaceWithPagination> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'trip');
  }

  count(params?: TripSearchInterfaceWithPagination): Observable<string> {
    const jsonParams = this.paramGetList(params);
    jsonParams.method = `${this.method}:searchcount`;

    return this.callOne(jsonParams).pipe(map((data) => data.data.count));
  }

  exportTrips(filter: TripExportParamsInterface): Observable<any> {
    const params: TripExportParamsInterface = {
      ...filter,
      date: {
        start: startOfDay(filter.date.start),
        end: endOfDay(filter.date.end),
      },
    };
    const jsonRPCParam = new JsonRPCParam(`${this.method}:export`, params);
    return this.callOne(jsonRPCParam);
  }

  getTrips(params?: TripSearchInterfaceWithPagination): Observable<TripSearchResultInterface> {
    return new Subject();
    return this.callOne(this.paramGetList(params));
  }
}
