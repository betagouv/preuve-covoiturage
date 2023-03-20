import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { DowloadCertificateBase } from '~/core/entities/api/shared/certificate/download.contract';
import { ResultInterface as FindResultInterface } from '~/core/entities/api/shared/certificate/find.contract';
import {
  ParamsInterface as ListParamsInterface,
  ResultInterface as ListResultInterface,
} from '~/core/entities/api/shared/certificate/list.contract';
import {
  ParamsInterface as CreateParamsInterface,
  ResultInterface as CreateResultInterface,
} from '~/core/entities/api/shared/certificate/create.contract';
import { JsonRPC } from '~/core/services/api/json-rpc.service';

export type IdentityIdentifiersInterface =
  | { _id: number }
  | { phone: string }
  | { operator_user_id: string }
  | { phone_trunc: string; operator_user_id: string };

@Injectable({
  providedIn: 'root',
})
export class CertificateApiService extends JsonRPC {
  constructor(http: HttpClient) {
    super(http);
  }

  async downloadPrint(uuid: string, data: DowloadCertificateBase): Promise<void> {
    return this.http
      .post(`v3/certificates/${uuid}/attachment`, data, { responseType: 'arraybuffer', withCredentials: true })
      .toPromise()
      .then((response) => {
        saveAs(new Blob([response], { type: 'application/pdf' }), `covoiturage-${uuid}.pdf`);
      });
  }

  getList(certificateListFilter: ListParamsInterface): Observable<ListResultInterface> {
    return super
      .callOne(new JsonRPCParam<ListParamsInterface>('certificate:list', certificateListFilter))
      .pipe(map((response) => response.data));
  }

  create(certificate: CreateParamsInterface): Observable<CreateResultInterface> {
    return this.http
      .post(`v3/certificates`, certificate, { withCredentials: true })
      .pipe(map((data: any) => data.result.data as CreateResultInterface));
  }

  find(uuid: string): Observable<FindResultInterface> {
    return this.http.get(`v3/certificates/${uuid}`).pipe(map((data: any) => data.result.data as FindResultInterface));
  }
}
