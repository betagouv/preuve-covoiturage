import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { StatInterface } from '~/core/interfaces/stat/StatInterface';
import { JsonRpcGetList } from '~/core/services/api/json-rpc.getlist';

@Injectable({
  providedIn: 'root',
})
export class StatApiService extends JsonRpcGetList<StatInterface> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'trip');
  }

  paramGetList(params?) {
    return new JsonRPCParam(`${this.method}:stats`, { ...this.defaultListParam, ...params });
  }
}
