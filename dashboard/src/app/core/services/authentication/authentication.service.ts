import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { UserService } from './user.service';
import { JsonRPCParam } from '../../entities/api/jsonRPCParam';
import { JsonRPCService } from '../api/json-rpc.service';
import { User } from '../../entities/authentication/user';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public static STORAGE_KEY = 'CARPOOLING_USER';
  private _token$ = new BehaviorSubject<string>(null);

  constructor(
    private _userService: UserService,
    private _jsonRPC: JsonRPCService,
    private router: Router,
    private toastr: ToastrService,
  ) {
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

  public logout() {
    // TODO CALL BACK
    this._token$.next(null);
    this._userService.user = null;
    this.router.navigate(['/login']).then(() => {
      this.toastr.success('Vous avez bien été déconnecté');
    });
  }

  public changePassword(oldPassword: string, newPassword: string): void {
    const jsonRPCParam = new JsonRPCParam('user.changePassword', {
      oldPassword,
      newPassword,
    });

    this._jsonRPC.call(jsonRPCParam).subscribe(
      (data) => {
        console.log('success', data);
      },
      (err) => {
        console.log('error', err);
      },
    );
  }

  public hasAnyGroup(groups: string[]): string {
    const user = this._userService.user;
    if (!user) return null;

    // no groups mean all
    if (!groups.length) {
      return user.group;
    }

    if (user && groups.includes(user.group)) {
      return user.group;
    }

    return null;
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
        email: 'preuve.decovoit@yopmail.com',
      }),
    });
  }

  private onLoggin(response) {
    this._token$.next(response.authToken);
    this._userService.user = response.user;
  }
}
