import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';

import { ParamsInterface as ListParamsInterface } from '~/core/entities/api/shared/policy/list.contract';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import {
  ParamsInterface as CampaignStateParam,
  ResultInterface as CampaignStateResult,
  signature as campaignStateSignature,
} from '../../../../../../shared/policy/stats.contract';

import {
  ParamsInterface as SimulateOnPastParam,
  ResultInterface as SimulateOnPastResult,
  signature as simulateOnPastSignature,
} from '../../../../../../shared/policy/stats.contract';

@Injectable({
  providedIn: 'root',
})
export class CampaignApiService extends JsonRpcCrud<Campaign, Campaign, {}, any, any, ListParamsInterface, any, {}> {
  constructor(http: HttpClient, protected auth: AuthenticationService) {
    super(http, 'campaign');
  }

  getById(id: number): Observable<Campaign> {
    return this.get({ _id: id, territory_id: this.auth.user.territory_id } as any);
  }

  loadTemplates(): Observable<Campaign[]> {
    return this.callOne(new JsonRPCParam(`${this.method}:templates`, {})).pipe(map((data) => data.data as Campaign[]));
  }

  stat(campaignId: number): Observable<CampaignStateResult> {
    const jsonRPCParam: JsonRPCParam<CampaignStateParam> = new JsonRPCParam(campaignStateSignature, {
      _id: campaignId,
    });
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data as CampaignStateResult));
  }

  simulate(campaign: SimulateOnPastParam): Observable<SimulateOnPastResult> {
    const jsonRPCParam = new JsonRPCParam(simulateOnPastSignature, { campaign });
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }
}
