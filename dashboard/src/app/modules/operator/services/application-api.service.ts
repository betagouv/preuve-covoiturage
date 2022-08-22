import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Application } from '~/core/entities/operator/application';
import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
// tslint:disable-next-line:max-line-length
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { ParamsInterface as ApplicationCreateInterface } from '~/core/entities/api/shared/application/create.contract';

@Injectable({
  providedIn: 'root',
})
export class ApplicationApiService extends JsonRpcCrud<Application> {
  constructor(http: HttpClient) {
    super(http, 'application');
  }

  public createApplicationAndList(application: ApplicationCreateInterface): Observable<any> {
    return this.http.post(
      'applications',
      {
        permissions: ['journey.create'],
        ...application,
      },
      { withCredentials: true },
    );
  }

  public revokeAndList(application: Application): Observable<Application> {
    const jsonRPCParam = new JsonRPCParam(`${this.method}:revoke`, { uuid: application.uuid });
    return super.callOne(jsonRPCParam).pipe(map((data) => data.data));
  }
}
