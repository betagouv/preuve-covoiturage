import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { Application } from '~/core/entities/operator/application';
// tslint:disable-next-line:max-line-length
import { ParamsInterface as ApplicationCreateInterface } from '~/core/entities/api/shared/application/create.contract';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';

@Injectable({
  providedIn: 'root',
})
export class ApplicationApiService extends JsonRpcCrud<Application> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'application');
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
