import { DEFAULT } from './../../../../../../api/services/policy/src/engine/helpers/type';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';
import { TripStatInterface } from '~/core/entities/api/shared/trip/common/interfaces/TripStatInterface';
import { ApiGraphTimeMode } from './ApiGraphTimeMode';

@Injectable({
  providedIn: 'root',
})
export class StatApiService extends JsonRpcGetList<StatInterface, StatInterface, any, TripStatInterface> {
  private static DEFAULT_START_DATE: Date = new Date(new Date().setMonth(new Date().getMonth() - 12));
  private static DEFAULT_END_DATE: Date = new Date(new Date().setDate(new Date().getDate() - 5));

  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'trip');
  }

  paramGetList(params?: TripStatInterface): JsonRPCParam {
    // Merge default values with provided ones
    const finalParams = {
      ...params,
      tz: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Europe/Paris',
    };

    if (!finalParams.date) {
      finalParams.date = {};
    }

    // Set default start date if none and add hours
    if (!finalParams.date.start) {
      finalParams.date.start = StatApiService.DEFAULT_START_DATE;
    } else {
      finalParams.date.start = new Date(finalParams.date.start);
    }
    finalParams.date.start.setHours(2, 0, 0, 0);

    // Set default end date if none and add hours
    console.log(finalParams.date.end);
    if (!finalParams.date.end) {
      if (params.group_by === ApiGraphTimeMode.Day) {
        finalParams.date.end = new Date(finalParams.date.start.setDate(finalParams.date.start.getDate() + 14));
      } else {
        finalParams.date.end = StatApiService.DEFAULT_END_DATE;
      }
      console.log(finalParams.date.end);
    } else {
      finalParams.date.end = new Date(finalParams.date.end);
    }
    finalParams.date.end.setHours(2, 0, 0, 0);

    return new JsonRPCParam(`${this.method}:stats`, finalParams);
  }

  getTotalStats(params?: TripStatInterface): Observable<StatInterface> {
    // All graph time Mode is forced;
    params = { ...params, group_by: ApiGraphTimeMode.All };

    return this.callOne(this.paramGetList(params)).pipe(map(({ data }) => data[0]));
  }
}
