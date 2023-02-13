import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { ParamsInterface as ListParamsInterface } from '~/core/entities/api/shared/policy/list.contract';
import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';
import { CompiledPolicyInterface } from '~/shared/policy/common/interfaces/PolicyInterface';
import {
  ParamsInterface as SimulateOnPastParam,
  ResultInterface as SimulateOnPastResult,
  signature as simulateOnPastSignature,
} from '~/shared/policy/getPastSimulationOrCompute.contract';

@Injectable({
  providedIn: 'root',
})
export class CampaignApiService extends JsonRpcCrud<
  CompiledPolicyInterface,
  CompiledPolicyInterface,
  {},
  any,
  any,
  ListParamsInterface,
  any,
  {}
> {
  constructor(http: HttpClient, protected auth: AuthenticationService) {
    super(http, 'campaign');
  }

  getById(id: number): Observable<CompiledPolicyInterface> {
    return this.get({ _id: id, territory_id: this.auth.user.territory_id } as any);
  }

  loadTemplates(): Observable<CompiledPolicyInterface[]> {
    return this.callOne(new JsonRPCParam(`${this.method}:templates`, {})).pipe(
      map((data) => data.data as CompiledPolicyInterface[]),
    );
  }

  simulate(campaign: SimulateOnPastParam): Observable<SimulateOnPastResult> {
    const jsonRPCParam = new JsonRPCParam(simulateOnPastSignature, campaign);
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }
}
