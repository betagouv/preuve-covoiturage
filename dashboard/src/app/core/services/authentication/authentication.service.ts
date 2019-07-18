import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { UserService } from './user.service';
import { JsonRPCParam } from '../../entities/api/jsonRPCParam';
import { JsonRPCService } from '../api/json-rpc.service';
import {User} from '../../entities/authentication/user';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public static STORAGE_KEY = 'CARPOOLING_USER';
  private _token$ = new BehaviorSubject<string>(null);

  constructor(private _userService: UserService,
              private _jsonRPC: JsonRPCService) {
    this.readToken();
  }

  public get token$() {
    return this._token$;
  }

  public get token() {
    return this._token$.value;
  }

  public login(email: string, password: string) {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user.login';
    jsonRPCParam.params = {
      email,
      password,
    };

    this._jsonRPC.call(jsonRPCParam).subscribe(
      (data) => {
        console.log('success', data);
      },
      (err) => {
        console.log('error', err);
      },
    );
  }

  public changePassword(oldPassword: string, newPassword: string): void {
    const jsonRPCParam = new JsonRPCParam('user.changePassword', {
      oldPassword,
      newPassword,
    });

    this.jsonRPC.call(jsonRPCParam).subscribe(
      (data) => {
        console.log('success', data);
      },
      (err) => {
        console.log('error', err);
      },
    );
  }

  private readToken() {
    const responseStr = localStorage.getItem(AuthenticationService.STORAGE_KEY);
    if (responseStr != null) {
      const response = JSON.parse(responseStr);
      this.onLoggin(response);
    }

    // TODO DELETE WHEN LOGIN IS OK
    this.onLoggin({
      user: new User({
        _id: 1,
        firstname: 'Preuve',
        lastname: 'Decovoit',
        email: 'preuve.decovoit@yopmail.com'
      })
    });
  }

  private onLoggin(response) {
    this._token$.next(response.authToken);
    this._userService.user = response.user;
  }
}
