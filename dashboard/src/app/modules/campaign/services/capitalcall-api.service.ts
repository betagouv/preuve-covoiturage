import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ResultInterface as CapitalCallListResult,
  ParamsInterface as CapitalCallListParams,
  signature as capitalCallListSignature,
} from '~/shared/capitalcall/list.contract';
import { JsonRPCParam } from '../../../core/entities/api/jsonRPCParam';
import { JsonRPCService } from '../../../core/services/api/json-rpc.service';

@Injectable({
  providedIn: 'root',
})
export class CapitalcallApiService extends JsonRPCService {
  constructor(http: HttpClient) {
    super(http);
  }

  list(territoryId?: number): Observable<CapitalCallListResult> {
    const jsonRPCParam: JsonRPCParam<CapitalCallListParams> = new JsonRPCParam(
      capitalCallListSignature,
      territoryId ? { territory_id: territoryId } : {},
    );
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data as CapitalCallListResult));
  }
}
