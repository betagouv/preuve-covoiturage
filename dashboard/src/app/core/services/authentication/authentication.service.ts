import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { PermissionType } from '~/core/types/permissionType';
import { territoriesPermissions } from '~/core/config/permissions';

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

  public get isAdmin(): boolean {
    return this.hasRole('admin');
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

  /**
   * Check if connected user has any of list of permissions
   */
  public hasAnyPermission(permissions: PermissionType[]): boolean {
    const user = this._userService.user;
    if (!permissions.length) {
      return true;
    }
    if ('permissions' in user) {
      return user.permissions.filter((permission: PermissionType) => permissions.includes(permission)).length > 0;
    }
    return true;
  }

  /**
   * Check if connected user has any of list of groups
   */
  public hasAnyGroup(groups: string[]): boolean {
    const user = this._userService.user;
    return !groups.length || ('group' in user && groups.includes(user.group));
  }

  /**
   * Check if connected user has role
   */
  public hasRole(role: string): boolean {
    const user = this._userService.user;
    return !role || ('role' in user && role === user.role);
  }

  public sendForgottenPasswordEmail(email: string): Observable<any> {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user.forgottenPassword';
    jsonRPCParam.params = {
      email,
    };

    return this._jsonRPC.call(jsonRPCParam);
  }

  /**
   * Check validity of token & reset
   */
  public checkPasswordToken(reset: string, token: string): Observable<any> {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user.checkPasswordToken';
    jsonRPCParam.params = {
      reset,
      token,
    };

    return this._jsonRPC.call(jsonRPCParam);
  }

  /**
   * Check validity of token & reset
   */
  public checkEmailToken(reset: string, token: string): Observable<any> {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user.checkEmailToken';
    jsonRPCParam.params = {
      reset,
      token,
    };

    return this._jsonRPC.call(jsonRPCParam);
  }

  public sendNewPassword(password: string, reset: string, token: string): Observable<any> {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user.resetPassword';
    jsonRPCParam.params = {
      password,
      reset,
      token,
    };

    return this._jsonRPC.call(jsonRPCParam);
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
        role: 'admin',
        permissions: territoriesPermissions.admin,
      }),
    });
  }

  private onLoggin(response) {
    this._token$.next(response.authToken);
    this._userService.user = response.user;
  }
}
