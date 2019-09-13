import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import { PermissionType } from '~/core/types/permissionType';
import { User } from '~/core/entities/authentication/user';

import { UserService } from './user.service';
import { JsonRPCParam } from '../../entities/api/jsonRPCParam';
import { JsonRPCService } from '../api/json-rpc.service';
import { JsonRPCPayload } from '~/core/entities/api/jsonRPCPayload';

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
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user.login';
    jsonRPCParam.params = {
      email,
      password,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    // console.log('environment.apiUrl+\'/login\' : ', environment.apiUrl + '/login');
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
          if (loginPayload && loginPayload.payload && loginPayload.payload.data) {
            return loginPayload.payload.data;
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

  public changePassword(oldPassword: string, newPassword: string): void {
    const jsonRPCParam = new JsonRPCParam('user.changePassword', {
      oldPassword,
      newPassword,
    });

    this._jsonRPC.callOne(jsonRPCParam).subscribe(
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
  public hasAnyGroup(groups: string[] | null = null): boolean {
    if (!groups) {
      return true;
    }
    const user = this._userService.user;
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
    return !role || ('role' in user && role === user.role);
  }

  public sendInviteEmail(user: User): Observable<JsonRPCPayload> {
    return this._jsonRPC.callOne(new JsonRPCParam('user:sendInviteEmail', { _id: user._id }));
  }

  public sendForgottenPasswordEmail(email: string): Observable<any> {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user.forgottenPassword';
    jsonRPCParam.params = {
      email,
    };

    return this._jsonRPC.callOne(jsonRPCParam);
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

    return this._jsonRPC.callOne(jsonRPCParam);
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

    return this._jsonRPC.callOne(jsonRPCParam);
  }

  public sendNewPassword(password: string, reset: string, token: string): Observable<any> {
    const jsonRPCParam = new JsonRPCParam();
    jsonRPCParam.method = 'user.resetPassword';
    jsonRPCParam.params = {
      password,
      reset,
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
