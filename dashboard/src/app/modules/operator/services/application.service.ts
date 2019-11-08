import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { ApiService } from '~/core/services/api/api.service';
import { ApplicationName } from '~/core/entities/operator/applicationName';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import {
  ApplicationInterface,
  OperatorApplicationCreatedInterface,
} from '~/core/interfaces/operator/applicationInterface';
import { AuthenticationService } from '~/core/services/authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService extends ApiService<ApplicationInterface> {
  constructor(
    private _http: HttpClient,
    private _jsonRPC: JsonRPCService,
    private _authService: AuthenticationService,
  ) {
    super(_http, _jsonRPC, 'application');
  }

  get loaded(): boolean {
    return this._loaded$.value;
  }

  get application$(): Observable<ApplicationInterface[]> {
    return this._entities$.pipe(
      map((operatorApplications: ApplicationInterface[]) =>
        operatorApplications
          .map((operatorApplication) => {
            operatorApplication.created_at = new Date(operatorApplication.created_at);
            return operatorApplication;
          })
          // @ts-ignore
          .sort((a, b) => b.created_at - a.created_at),
      ),
    );
  }

  get operatorApplications(): ApplicationInterface[] {
    return this._entities$.value;
  }

  load(): Observable<ApplicationInterface[]> {
    if ('operator_id' in this._authService.user) {
      const operatorId = this._authService.user.operator_id;
      return super.load({
        owner_id: operatorId,
      });
    }
    console.log('only operator users can create applications');
    throw Error();
  }

  public createApplicationAndList(
    applicationName: ApplicationName,
  ): Observable<[OperatorApplicationCreatedInterface, ApplicationInterface[]]> {
    if ('operator_id' in this._authService.user) {
      // const operatorId = this._authService.user.operator_id;
      // const jsonRPCParam = new JsonRPCParam(`${this._method}:create`, {
      //   operator_id: operatorId,
      //   permissions: ['journey.create'],
      //   ...applicationName,
      // });
      // return this._jsonRPC.callOne(jsonRPCParam).pipe(
      //   map((data) => data.data),
      //   mergeMap((createdEntity: { token: string }) =>
      //     this.load().pipe(
      //       map((entities) => <[OperatorApplicationCreatedInterface, ApplicationInterface[]]>[
      //       createdEntity,
      //       entities
      //       ]),
      //     ),
      //   ),
      // );

      const operatorId = this._authService.user.operator_id;

      return this._http
        .post(
          'applications',
          {
            owner_id: operatorId,
            permissions: ['journey.create'],
            ...applicationName,
          },
          { withCredentials: true },
        )
        .pipe(
          mergeMap((createdEntity: { token: string }) =>
            this.load().pipe(
              map(
                (entities) => <[OperatorApplicationCreatedInterface, ApplicationInterface[]]>[createdEntity, entities],
              ),
            ),
          ),
        );
    }
    console.log('only operator users can create applications');
    throw Error();
  }

  public revokeAndList(id: string): Observable<[ApplicationInterface, ApplicationInterface[]]> {
    const jsonRPCParam = new JsonRPCParam(`${this._method}:revoke`, { _id: id });
    return this._jsonRPC.callOne(jsonRPCParam).pipe(
      map((data) => data.data),
      mergeMap((deletedEntity: ApplicationInterface) => {
        console.log(`deleted ${this._method} id=${deletedEntity._id}`);
        return this.load().pipe(
          map((entities) => <[ApplicationInterface, ApplicationInterface[]]>[deletedEntity, entities]),
        );
      }),
    );
  }
}
