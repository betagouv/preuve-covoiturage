import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ResultInterface as CapitalCallListResult,
  signature as capitalCallListSignature,
} from '~/shared/trip/listCapitalCalls.contract';
import { JsonRPCParam } from '../../../core/entities/api/jsonRPCParam';
import { JsonRPCService } from '../../../core/services/api/json-rpc.service';

@Injectable({
  providedIn: 'root',
})
export class CapitalcallApiService extends JsonRPCService {
  constructor(http: HttpClient) {
    super(http);
  }

  list(): Observable<CapitalCallListResult> {
    const jsonRPCParam: JsonRPCParam<{}> = new JsonRPCParam(capitalCallListSignature, {});
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data as CapitalCallListResult));
  }

  download() {
    throw new Error('Method not implemented.');
  }
}
