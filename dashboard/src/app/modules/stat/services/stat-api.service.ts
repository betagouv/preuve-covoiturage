import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';

import { TripSearchInterface } from '~/core/entities/api/shared/trip/common/interfaces/TripSearchInterface';

@Injectable({
  providedIn: 'root',
})
export class StatApiService extends JsonRpcGetList<StatInterface, StatInterface, any, TripSearchInterface> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'trip');
  }

  paramGetList(params?): JsonRPCParam {
    const finalParams = {
      ...this.defaultListParam,
      ...params,
    };

    if (!finalParams.date) {
      finalParams.date = {};
    }

    if (!finalParams.date.start) {
      const nowMinus1Year = new Date();
      nowMinus1Year.setMonth(nowMinus1Year.getMonth() - 12);
      nowMinus1Year.setHours(0, 0, 0, 0);
      finalParams.date.start = nowMinus1Year.toISOString();
    }

    return new JsonRPCParam(`${this.method}:stats`, finalParams);
  }
}
