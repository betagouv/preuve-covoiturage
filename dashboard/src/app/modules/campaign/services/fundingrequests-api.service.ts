import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  ResultInterface as FundingRequestsListResult,
  ParamsInterface as FundingRequestsListParams,
  signature as fundingRequestsListSignature,
} from '~/shared/policy/fundingRequestsList.contract';
import { JsonRPCParam } from '../../../core/entities/api/jsonRPCParam';
import { JsonRPCService } from '../../../core/services/api/json-rpc.service';

@Injectable({
  providedIn: 'root',
})
export class FundingRequestsApiService extends JsonRPCService {
  constructor(http: HttpClient) {
    super(http);
  }

  list(campaign_id?: number): Observable<FundingRequestsListResult> {
    const jsonRPCParam: JsonRPCParam<FundingRequestsListParams> = new JsonRPCParam(
      fundingRequestsListSignature,
      campaign_id ? { campaign_id } : {},
    );
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data as FundingRequestsListResult));
  }
}
