import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';
import { TripSearchInterface } from '~/core/entities/api/shared/trip/common/interfaces/TripSearchInterface';
import { ApiGraphTimeMode } from './ApiGraphTimeMode';

@Injectable({
  providedIn: 'root',
})
export class StatApiService extends JsonRpcGetList<StatInterface, StatInterface, any, TripSearchInterface> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'trip');
  }

  paramGetList(params?: TripSearchInterface): JsonRPCParam {
    const finalParams = {
      ...this.defaultListParam,
      ...params,
      tz: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Europe/Paris',
    };

    if (!finalParams.date) {
      finalParams.date = {};
    }

    // init start
    const start: Date = finalParams.date.start
      ? new Date(finalParams.date.start)
      : new Date(new Date().setMonth(new Date().getMonth() - 12));
    start.setHours(2, 0, 0, 0);
    finalParams.date.start = start.toISOString();

    // init end
    const end: Date = finalParams.date.end
      ? new Date(finalParams.date.end)
      : new Date(new Date().setDate(new Date().getDate() - 5));
    end.setHours(2, 0, 0, 0);
    finalParams.date.end = end.toISOString();

    return new JsonRPCParam(`${this.method}:stats`, finalParams);
  }

  getTotalStats(params?: TripSearchInterface): Observable<StatInterface> {
    // All graph time Mode is forced;
    params = { ...params, group_by: ApiGraphTimeMode.All };

    return this.callOne(this.paramGetList(params)).pipe(map(({ data }) => data[0]));
  }
}
