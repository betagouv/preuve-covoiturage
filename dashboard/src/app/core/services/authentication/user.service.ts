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
  groupLabels: { [key: string]: string } = {
    territory: 'Territoire',
    operator: 'Opérateur',
    registry: 'Registre',
  };

  private _user$ = new BehaviorSubject<User>(null);

  constructor(private _http: HttpClient, private _jsonRPC: JsonRPCService) {
    super(_http, _jsonRPC, 'user');
  }

  set user(user: User) {
    this._user$.next(user);
  }

  get user(): User {
    return this._user$.value;
  }

  get user$(): Observable<User> {
    return this._user$;
  }
}
