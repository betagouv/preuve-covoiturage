import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { JsonRPCService } from '~/core/services/api/json-rpc.service';
import { ApiService } from '~/core/services/api/api.service';
import { User } from '~/core/entities/authentication/user';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiService<User> {
  // private _user$ = new BehaviorSubject<User>(null);

  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'user');
  }

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
}
