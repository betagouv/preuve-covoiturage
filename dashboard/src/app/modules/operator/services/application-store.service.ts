import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CrudStore } from '~/core/services/store/crud-store';
import { ApplicationApiService } from '~/modules/operator/services/application-api.service';
import { Application } from '~/core/entities/operator/application';
// eslint-disable-next-line
import { ParamsInterface as ApplicationCreateInterface } from '~/core/entities/api/shared/application/create.contract';
// eslint-disable-next-line
import { ApplicationCreateResultInterface } from '~/core/entities/api/shared/application/common/interfaces/ApplicationCreateResultInterface';

@Injectable({
  providedIn: 'root',
})
export class ApplicationStoreService extends CrudStore<Application, Application, any, ApplicationApiService> {
  constructor(protected applicationApi: ApplicationApiService) {
    super(applicationApi, Application);
  }

  public createApplicationAndList(
    application: ApplicationCreateInterface,
  ): Observable<ApplicationCreateResultInterface> {
    return this.rpcCrud.createApplicationAndList(application).pipe(
      tap(() => {
        this.loadList();
      }),
    );
  }

  public revokeAndList(application: Application): Observable<Application> {
    return this.rpcCrud.revokeAndList(application).pipe(
      tap(() => {
        this.loadList();
      }),
    );
  }
}
