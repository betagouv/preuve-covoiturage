import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { ApiService } from '~/core/services/api/api.service';
import { User } from '~/core/entities/authentication/user';
import { IModel } from '~/core/entities/IModel';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiService<User> {
  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService, private toastr: ToastrService) {
    super(_http, _jsonRPC, 'user');
  }

  protected _defaultListParams = { limit: 10000 };

  get user() {
    return this._entity$.value;
  }

  set user(user) {
    if (user !== this._entity$.value) {
      this._entity$.next(user);
    }
  }

  get user$(): Observable<User> {
    return this._entity$;
  }

  catchPatchError<T>(patchObs: Observable<T>): Observable<T> {
    return patchObs.pipe(
      catchError((error) => {
        if (error.code === -32000) {
          console.log('error : ', error);
          this.toastr.error('Cette adresse email est déjà utilisée');
          // return of(null);
        }

        throw error;
      }),
    );
  }

  patchList(item: IModel): Observable<[User, User[]]> {
    return this.catchPatchError<[User, User[]]>(super.patchList(item));
  }

  patch(item: User): Observable<User> {
    return this.catchPatchError<User>(super.patch(item));
  }
}
