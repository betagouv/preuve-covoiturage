import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { ResultInterface as FindResultInterface } from '~/core/entities/api/shared/certificate/find.contract';
import {
  ParamsInterface as ListParamsInterface,
  ResultInterface as ListResultInterface,
} from '~/core/entities/api/shared/certificate/list.contract';

import { JsonRPC } from '~/core/services/api/json-rpc.service';
import { ParamsInterface as DownloadParamsInterface } from '~/core/entities/api/shared/certificate/download.contract';
import { environment } from '../../../../environments/environment';

import { PointInterface } from '~/core/entities/api/shared/common/interfaces/PointInterface';

export type IdentityIdentifiersInterface =
  | { _id: number }
  | { uuid: string }
  | { phone: string }
  | { phone_trunc: string; operator_user_id: string };

export interface CreateParamsInterface {
  tz: string;
  identity: IdentityIdentifiersInterface;
  operator_id: number;
  positions?: PointInterface[];
  start_at?: string;
  end_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CertificateApiService extends JsonRPC {
  constructor(http: HttpClient, router: Router, activedRoute: ActivatedRoute) {
    super(http, router, activedRoute);
  }

  downloadPrint(data: DownloadParamsInterface): void {
    window.open(`${environment.apiUrl}v2/certificates/pdf/${data.uuid}`);
  }

  getList(certificateListFilter: ListParamsInterface): Observable<ListResultInterface> {
    return super
      .callOne(new JsonRPCParam<ListParamsInterface>('certificate:list', certificateListFilter))
      .pipe(map((response) => response.data));
  }

  create(certificate: CreateParamsInterface): Observable<Record<string, any>> {
    return super
      .callOne(new JsonRPCParam<CreateParamsInterface>('certificate:create', certificate))
      .pipe(map((response) => response.data));
  }

  find(uuid: string): Observable<FindResultInterface> {
    return this.http
      .get(`v2/certificates/find/${uuid}`)
      .pipe(map((data: any) => data.result.data as FindResultInterface));
  }
}
