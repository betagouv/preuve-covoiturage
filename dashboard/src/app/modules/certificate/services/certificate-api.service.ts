import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import {
  ParamsInterface as FindParamsInterface,
  ResultInterface as FindResultInterface,
} from '~/core/entities/api/shared/certificate/find.contract';
import { JsonRPC } from '~/core/services/api/json-rpc.service';
import { ParamsInterface as PrintParamsInterface } from '~/core/entities/api/shared/certificate/print.contract';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CertificateApiService extends JsonRPC {
  constructor(http: HttpClient, router: Router, activedRoute: ActivatedRoute) {
    super(http, router, activedRoute);
  }
  // print(identity: string) {
  //   throw new Error('Not implemented');
  // }
  // render(identity: string) {
  //   throw new Error('Not implemented');
  // }

  downloadPrint(data: PrintParamsInterface) {
    const startVar = data.start_at ? `&start_at=${encodeURIComponent(data.start_at.toISOString())}` : '';
    const endVar = data.end_at ? `&end_at=${encodeURIComponent(data.end_at.toISOString())}` : '';

    const url = `${environment.apiUrl}certificates/print?identity=${encodeURIComponent(
      data.identity,
    )}${startVar}${endVar}`;

    window.open(url, '_blank');
  }

  find(uuid: string): Observable<FindResultInterface> {
    console.log('uuid : ', uuid);
    // return of({
    //   uuid: '34999a03-cfc5-463e-8d64-97af0f507004',
    //   signature: '5xQw9KTH5Y9sIuOulU5KPEfreFPlfxljE3uwdkpDpb8=',
    //   start_at: new Date('2019-01-01T00:00:00.000Z'),
    //   end_at: new Date('2020-01-17T12:38:32.801Z'),
    //   created_at: new Date('2020-01-17T12:38:32.832Z'),
    //   total_km: 9597,
    //   total_point: 0,
    //   total_cost: 0,
    //   remaining: 0,
    // }).pipe(delay(3000));

    return super
      .callOne(new JsonRPCParam<FindParamsInterface>('certificate:find', { uuid }))
      .pipe(map((response) => response.data));
  }
}
