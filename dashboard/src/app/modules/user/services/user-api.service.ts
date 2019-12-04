import { Observable, of } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { User, BaseUser } from '~/core/entities/authentication/user';
import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';
import { UserPatchInterface } from '~/core/entities/api/shared/user/common/interfaces/UserPatchInterface';
import { UserListInterface } from '~/core/entities/api/shared/user/common/interfaces/UserListInterface';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class UserApiService extends JsonRpcCrud<User, UserListInterface, UserPatchInterface> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute, protected _toastr: ToastrService) {
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

  protected catchEmailConflict<T>(obs$: Observable<T>): Observable<T> {
    return obs$.pipe(
      catchHttpStatus(409, (err) => {
        this._toastr.error("L'email rentré est déjà utilisé");
        throw err;
      }),
    );
  }

  patch(id: number, patch: UserPatchInterface) {
    return this.catchEmailConflict(super.patch(id, patch));
  }

  create(item: User): Observable<User> {
    return this.catchEmailConflict(super.create(item));
  }

  update(item: User): Observable<User> {
    return this.catchEmailConflict(super.update(item));
  }
}
