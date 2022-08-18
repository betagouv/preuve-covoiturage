import { Injectable } from '@angular/core';
import { map } from 'lodash-es';
import { Observable } from 'rxjs';

import {
  ResultInterface as CapitalCallListResult,
  signature as capitalCallListSignature,
} from '~/shared/trip/listCapitalCalls.contract';
import { JsonRPCParam } from '../../../core/entities/api/jsonRPCParam';

@Injectable({
  providedIn: 'root',
})
export class CapitalcallApiService {
  constructor() {}

  capitalcalls(): Observable<CapitalCallListResult> {
    const jsonRPCParam: JsonRPCParam<{}> = new JsonRPCParam(capitalCallListSignature, {});
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data as CapitalCallListResult));
  }
}
