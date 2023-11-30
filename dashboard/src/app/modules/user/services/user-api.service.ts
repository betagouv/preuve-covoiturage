import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import { UserListInterface } from '~/core/entities/api/shared/user/common/interfaces/UserListInterface';
import { UserPatchInterface } from '~/core/entities/api/shared/user/common/interfaces/UserPatchInterface';
import { User } from '~/core/entities/authentication/user';
import { UserInterface } from '~/core/interfaces/user/profileInterface';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';
import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';

@Injectable({
  providedIn: 'root',
})
export class UserApiService extends JsonRpcCrud<User, UserListInterface, UserPatchInterface> {
  constructor(
    http: HttpClient,
    protected _toastr: ToastrService,
  ) {
    super(http, 'user');
  }

  me(): Observable<User> {
    return this.http.get<UserInterface | null>('profile', { withCredentials: true }).pipe(
      catchError(() => of(null)),
      map((data) => (data ? new User(data) : null)),
      shareReplay(),
    );
  }

  protected catchEmailConflict<T>(obs$: Observable<T>): Observable<T> {
    return obs$.pipe(
      catchHttpStatus(409, (err) => {
        this._toastr.error("L'email est déjà utilisé");
        throw err;
      }),
    );
  }

  patch(id: number, patch: UserPatchInterface): Observable<any> {
    return this.catchEmailConflict(super.patch(id, patch));
  }

  create(item: User): Observable<User> {
    return this.catchEmailConflict(super.create(item));
  }

  update(item: User): Observable<User> {
    return this.catchEmailConflict(super.update(item));
  }
}
