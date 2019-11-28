import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { User } from '~/core/entities/authentication/user';
import { Observable } from 'rxjs';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { map, shareReplay } from 'rxjs/operators';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';
import { UserPatchInterface } from '~/core/entities/api/shared/user/common/interfaces/UserPatchInterface';
import { UserInterface } from '~/core/entities/api/shared/user/common/interfaces/UserInterface';
import { UserBaseInterface } from '~/core/entities/api/shared/user/common/interfaces/UserBaseInterface';
import { UserCreateParamsInterface } from '../../../../../../api/providers/schema/dist/models/user/interfaces';

@Injectable({
  providedIn: 'root',
})
export class UserApiService extends JsonRpcCrud<User, User, UserPatchInterface, any, UserCreateParamsInterface> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'user');
  }

  me(): Observable<User> {
    return this.callOne(new JsonRPCParam(`${this.method}:me`)).pipe(
      map(({ data }) => {
        // if forbidden return null
        if (data.error && data.error.code === -32503) {
          return null;
        }
        return new User(data);
      }),
      catchHttpStatus(401, (err) => null),
      shareReplay(),
    );
  }
}
