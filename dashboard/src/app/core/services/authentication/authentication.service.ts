import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UserService } from './user.service';
import { JsonRPCParam } from '../../entities/api/jsonRPCParam';
import { JsonRPCService } from '../api/json-rpc.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public static STORAGE_KEY = 'CARPOOLING_USER';
  private _token$ = new BehaviorSubject<string>(null);

  public get token$() {
    return this._token$;
  }

  public get token() {
    return this._token$.value;
  }

  constructor(private user: UserService, private jsonRPC: JsonRPCService) {
    this.readToken();
  }

  public login(email: string, password: string) {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user.login';
    jsonRPCParam.params = {
      email,
      password,
    };

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
  }

  private onLoggin(response) {
    this._token$.next(response.authToken);
    this.user.user = response.user;
  }
}
