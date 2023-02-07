import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ResultsInterface as ApdfListResult,
  ParamsInterface as ApdfListParams,
  signature as apdfListSignature,
} from '~/shared/apdf/list.contract';
import { JsonRPCParam } from '../../../core/entities/api/jsonRPCParam';
import { JsonRPCService } from '../../../core/services/api/json-rpc.service';

@Injectable({
  providedIn: 'root',
})
export class ApdfApiService extends JsonRPCService {
  constructor(http: HttpClient) {
    super(http);
  }

  list(campaign_id: number): Observable<ApdfListResult> {
    const jsonRPCParam: JsonRPCParam<ApdfListParams> = new JsonRPCParam(
      apdfListSignature,
      campaign_id ? { campaign_id } : {},
    );
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data as ApdfListResult));
  }
}
