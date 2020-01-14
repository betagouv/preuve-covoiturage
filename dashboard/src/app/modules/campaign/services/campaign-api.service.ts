import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CrudActions, DeleteResponse, JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';

import { ResultInterface as LaunchResultInterface } from '~/core/entities/api/shared/policy/launch.contract';
import { ParamsInterface as DeleteParamsInterface } from '~/core/entities/api/shared/policy/delete.contract';
import { ParamsInterface as CreateParamsInterface } from '~/core/entities/api/shared/policy/create.contract';
import { ParamsInterface as PatchParamsInterface } from '~/core/entities/api/shared/policy/patch.contract';
import { ParamsInterface as ListParamsInterface } from '~/core/entities/api/shared/policy/list.contract';

@Injectable({
  providedIn: 'root',
})
export class CampaignApiService extends JsonRpcCrud<
  Campaign,
  Campaign,
  PatchParamsInterface['patch'],
  any,
  any,
  ListParamsInterface,
  any,
  CreateParamsInterface
> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'campaign');
  }

  public launch(id: number): Observable<LaunchResultInterface> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:launch`, { _id: id });
    return this.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }

  deleteByTerritoryId(params: DeleteParamsInterface): Observable<DeleteResponse> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:${CrudActions.DELETE}`, params);
    return this.callOne(jsonRPCParam).pipe(
      map((data) => ({
        success: data.data,
        _id: params._id,
      })),
    );
  }
}
