import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { User } from '../../entities/authentication/user';
import { ApiService } from '../api/api.service';
import { JsonRPCService } from '../api/json-rpc.service';

@Injectable({
  providedIn: 'root',
})
export class UserService extends ApiService<User> {
  private _user$ = new BehaviorSubject<User>(null);

  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'user');
  }

  get user() {
    return this._user$.value;
  }

  set user(user) {
    if (user !== this._user$.value) {
      // if (user) {
      //   localStorage.setItem('_user', JSON.stringify(user));
      // } else {
      //   localStorage.removeItem('_user');
      // }
      this._user$.next(user);
    }
  }

  get user$(): Observable<User> {
    return this._user$;
  }
}
