import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import { PermissionType } from '~/core/types/permissionType';
import { User } from '~/core/entities/authentication/user';
import { JsonRPCResult } from '~/core/entities/api/jsonRPCResult';

import { UserService } from './user.service';
import { JsonRPCParam } from '../../entities/api/jsonRPCParam';
import { JsonRPCService } from '../api/json-rpc.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _hasChecked: boolean;

  constructor(
    private _userService: UserService,
    private _jsonRPC: JsonRPCService,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
  ) {}

  public get isAdmin(): boolean {
    return this.hasRole('admin');
  }

  public login(email: string, password: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const url = 'login';
    return this.http
      .post(
        url,
        {
          email,
          password,
        },
        {
          headers,
          withCredentials: true,
        },
      )
      .pipe(
        catchError((error) => {
          console.log('error : ', error);
          if (error.error && error.error.message === 'Forbidden') {
            return of(null);
          }
          return throwError(error);
        }),
        map((loginPayload) => {
          if (loginPayload && loginPayload.result && loginPayload.result.data) {
            return loginPayload.result.data;
          }
          return null;
        }),
        tap((user) => {
          if (user) {
            this.onLoggin(new User(user));
          } else {
            this.toastr.error('Mauvais Email ou mot de passe');
          }
        }),
      );
  }

  public logout() {
    this.http.post('logout', {}, { withCredentials: true }).subscribe((response) => {
      this._userService.user = null;
      this.router.navigate(['/login']).then(() => {
        this.toastr.success('Vous avez bien été déconnecté');
      });
    });
  }

  public changePassword(oldPassword: string, newPassword: string): Observable<JsonRPCResult> {
    const jsonRPCParam = new JsonRPCParam('user:changePassword', {
      old_password: oldPassword,
      new_password: newPassword,
    });

    return this._jsonRPC.callOne(jsonRPCParam).pipe(tap(console.log));
  }

  /**
   * Check if connected user has any of list of permissions
   */
  public hasAnyPermission(permissions: PermissionType[]): boolean {
    const user = this._userService.user;
    if (!permissions.length) {
      return true;
    }
    if (!user) {
      return false;
    }
    if ('permissions' in user) {
      return user.permissions.filter((permission: PermissionType) => permissions.includes(permission)).length > 0;
    }
    return true;
  }

  /**
   * Check if connected user has any of list of groups
   */
  public hasAnyGroup(groups: string[] | null = null): boolean {
    if (!groups) {
      return true;
    }
    const user = this._userService.user;
    if (!user) {
      return false;
    }
    return !groups.length || ('group' in user && groups.includes(user.group));
  }

  /**
   * Check if connected user has role
   */
  public hasRole(role: string | null): boolean {
    if (!role) {
      return true;
    }
    const user = this._userService.user;
    if (!user) {
      return false;
    }
    return !role || ('role' in user && role === user.role);
  }

  public sendInviteEmail(user: User): Observable<JsonRPCResult> {
    return this._jsonRPC.callOne(new JsonRPCParam('user:sendInviteEmail', { _id: user._id }));
  }

  public sendForgottenPasswordEmail(email: string): Observable<any> {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user:forgottenPassword';
    jsonRPCParam.params = {
      email,
    };

    return this._jsonRPC.callOne(jsonRPCParam);
  }

  /**
   * Check validity of token & reset
   */
  public checkPasswordToken(email: string, token: string): Observable<JsonRPCResult> {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user:checkPasswordToken';
    jsonRPCParam.params = {
      email,
      token,
    };

    return this._jsonRPC.callOne(jsonRPCParam);
  }

  /**
   * Check validity of token & reset
   */
  public confirmEmail(email: string, token: string): Observable<any> {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user:confirmEmail';
    jsonRPCParam.params = {
      email,
      token,
    };

    return this._jsonRPC.callOne(jsonRPCParam);
  }

  public sendNewPassword(email: string, password: string, token: string): Observable<any> {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user:resetPassword';
    jsonRPCParam.params = {
      email,
      password,
      token,
    };

    return this._jsonRPC.callOne(jsonRPCParam);
  }

  check(): Observable<User> {
    console.log('> check');
    if (this._hasChecked) {
      console.log('has checked', this._userService.user);
      return of(this._userService.user);
    }

    return this._jsonRPC.callOne(new JsonRPCParam('user:me')).pipe(
      map((data) => {
        console.log('data : ', data);
        // if forbidden return null
        if (data.data.error && data.data.error.code === -32503) {
          return null;
        }
        return new User(data.data);
      }),
      catchError((errorResponse) => {
        if (errorResponse.status === 401) return of(null);

        throw errorResponse;
      }),
      tap((user) => {
        if (user) this.onLoggin(user);
        this._hasChecked = true;
      }),
    );
  }

  private onLoggin(user) {
    console.log('> onLoggin', user);
    this._userService.user = user;
  }
}
