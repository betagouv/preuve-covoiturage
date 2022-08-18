import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { endOfDay, startOfDay } from 'date-fns';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { TripStatInterface } from '~/core/entities/api/shared/trip/common/interfaces/TripStatInterface';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';
import { ApiGraphTimeMode } from './ApiGraphTimeMode';

@Injectable({
  providedIn: 'root',
})
export class StatApiService extends JsonRpcGetList<StatInterface, StatInterface, any, TripStatInterface> {
  constructor(http: HttpClient) {
    super(http, 'trip');
  }

  paramGetList(params?: TripStatInterface): JsonRPCParam {
    const finalParams = {
      ...this.defaultListParam,
      ...params,
      tz: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Europe/Paris',
    };

    if (!finalParams.date) {
      finalParams.date = {};
    }

    // init start
    if (!finalParams.date.start) {
      finalParams.date.start = new Date(new Date().setMonth(new Date().getMonth() - 12));
    } else {
      finalParams.date.start = new Date(finalParams.date.start);
    }

    // init end
    if (!finalParams.date.end) {
      finalParams.date.end = new Date(new Date().setDate(new Date().getDate() - 5));
    } else {
      finalParams.date.end = new Date(finalParams.date.end);
    }

    finalParams.date.start = startOfDay(finalParams.date.start);
    finalParams.date.end = endOfDay(finalParams.date.end);

    return new JsonRPCParam(`${this.method}:stats`, finalParams);
  }

  getTotalStats(params?: TripStatInterface): Observable<StatInterface> {
    // All graph time Mode is forced;
    params = { ...params, group_by: ApiGraphTimeMode.All };

    return this.callOne(this.paramGetList(params)).pipe(map(({ data }) => data[0]));
  }
}
