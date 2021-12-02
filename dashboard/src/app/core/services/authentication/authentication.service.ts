import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { get } from 'lodash-es';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { User } from '~/core/entities/authentication/user';
import { JsonRPCResult } from '~/core/entities/api/jsonRPCResult';
import { Roles } from '~/core/enums/user/roles';
import { UserApiService } from '~/modules/user/services/user-api.service';
// import { UserStoreService } from '~/modules/user/services/user-store.service';

import { JsonRPCParam } from '~/core/entities/api/jsonRPCParam';
import { JsonRPCService } from '~/core/services/api/json-rpc.service';

import {
  ParamsInterface as ChangePasswordWithPasswordParam,
  ResultInterface as ChangePasswordWithPasswordResult,
} from '~/core/entities/api/shared/user/changePasswordWithToken.contract';

import {
  ParamsInterface as LoginParam,
  ResultInterface as LoginResult,
} from '~/core/entities/api/shared/user/login.contract';

import { ParamsInterface as ChangePasswordParam } from '~/core/entities/api/shared/user/changePassword.contract';

import {
  ParamsInterface as ForgottenPasswordParam,
  ResultInterface as ForgottenPasswordResult,
} from '~/core/entities/api/shared/user/forgottenPassword.contract';

import { ParamsInterface as SendInviteEmailParam } from '~/core/entities/api/shared/user/sendInvitationEmail.contract';

import {
  ParamsInterface as ForgottenPasswordTokenParam,
  ResultInterface as ForgottenPasswordTokenResult,
} from '~/core/entities/api/shared/user/checkForgottenToken.contract';

import {
  ParamsInterface as ConfirmEmailParam,
  ResultInterface as ConfirmEmailResult,
} from '~/core/entities/api/shared/user/confirmEmail.contract';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private isChecked: boolean;

  private _user$ = new BehaviorSubject<User>(null);

  constructor(private userApiService: UserApiService, private jsonRPC: JsonRPCService, private http: HttpClient) {}

  get user$(): Observable<User> {
    return this._user$;
  }

  get user(): User {
    return this._user$.getValue();
  }

  public static isAdmin(user?: User): boolean {
    return this.hasRole([Roles.RegistryAdmin, Roles.TerritoryAdmin, Roles.OperatorAdmin], user);
  }

  public static isSuperAdmin(user?: User): boolean {
    return this.hasRole(Roles.RegistryAdmin, user);
  }

  public static isRegistry(user?: User): boolean {
    return this.hasRole([Roles.RegistryAdmin, Roles.RegistryUser], user);
  }

  private static isTerritoryDemo(user?: User): boolean {
    return this.hasRole([Roles.TerritoryDemo], user);
  }

  public static isOperator(user?: User): boolean {
    return this.hasRole([Roles.OperatorAdmin, Roles.OperatorUser], user);
  }

  public static isTerritory(user?: User): boolean {
    return this.hasRole([Roles.TerritoryAdmin, Roles.TerritoryDemo, Roles.TerritoryUser], user);
  }

  public static hasRole(role: Roles | Roles[], user: User): boolean {
    const roles = Array.isArray(role) ? role : [role];
    if (!user) return false;
    return roles.indexOf(user.role) > -1;
  }

  public isAdmin(): boolean {
    return this.user ? AuthenticationService.isAdmin(this.user) : false;
  }

  public isSuperAdmin(): boolean {
    return this.user ? AuthenticationService.isSuperAdmin(this.user) : false;
  }

  public isRegistry(): boolean {
    return this.user ? AuthenticationService.isRegistry(this.user) : false;
  }

  public isOperator(): boolean {
    return this.user ? AuthenticationService.isOperator(this.user) : false;
  }

  public isTerritoryDemo(): boolean {
    return this.user ? AuthenticationService.isTerritoryDemo(this.user) : false;
  }

  public isTerritory(): boolean {
    return this.user ? AuthenticationService.isTerritory(this.user) : false;
  }

  public hasRole(role: Roles | Roles[]): boolean {
    return this.user ? AuthenticationService.hasRole(role, this.user) : false;
  }

  public call<T = any>(url: string, payload: T, withCredentials = true): Observable<any> {
    return this.http.post(url, payload, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      withCredentials,
    });
  }

  public login(email: string, password: string): Observable<LoginResult> {
    return this.call<LoginParam>('login', { email, password }).pipe(
      map((response) => get(response, 'result.data', null)),
      tap((user) => this.onLogin(user)),
    );
  }

  public check(): Observable<User> {
    if (this.isChecked) {
      return of(this._user$.value);
    }

    return this.userApiService.me().pipe(
      tap((user) => {
        this.isChecked = true;
        if (user) this.onLogin(user);
      }),
    );
  }

  private onLogin(user: User): void {
    this.isChecked = true;
    this._user$.next(user instanceof User ? user : new User(user));
  }

  public logout(): Observable<any> {
    return this.http.post('logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this._user$.next(null);
      }),
    );
  }

  // public hasAnyPermission(permissions: PermissionType[]): boolean {
  //   const user = this.user;
  //   if (!permissions.length) {
  //     return true;
  //   }
  //   if (!user) {
  //     return false;
  //   }
  //   if ('permissions' in user) {
  //     return user.permissions.filter((permission: PermissionType) => permissions.includes(permission)).length > 0;
  //   }
  //   return true;
  // }

  // public hasAnyPermissionObs(permissions: PermissionType[]): Observable<boolean> {
  //   return this.user$.pipe(map((user) => this.hasAnyPermission(permissions)));
  // }

  // public hasAnyGroup(groups: Group[] | null = null): boolean {
  //   const user = this.user;
  //   if (!groups && user) {
  //     return true;
  //   }

  //   if (!user) {
  //     return false;
  //   }
  //   return !groups.length || ('group' in user && groups.includes(user.group));
  // }

  public sendInviteEmail(user: User | number): Observable<JsonRPCResult> {
    const _id = typeof user === 'number' ? user : user._id;
    return this.jsonRPC.callOne(new JsonRPCParam<SendInviteEmailParam>('user:sendInvitationEmail', { _id }));
  }

  public sendForgottenPasswordEmail(email: string): Observable<ForgottenPasswordResult> {
    return this.call<ForgottenPasswordParam>('auth/reset-password', { email });
  }

  public changePassword(_id: number, old_password: string, new_password: string): Observable<any> {
    return this.jsonRPC.callOne(
      new JsonRPCParam<ChangePasswordParam>('user:changePassword', { _id, old_password, new_password }),
    );
  }

  public checkPasswordToken(email: string, token: string): Observable<ForgottenPasswordTokenResult> {
    return this.call<ForgottenPasswordTokenParam>('auth/check-token', { email, token });
  }

  public confirmEmail(email: string, token: string): Observable<ConfirmEmailResult> {
    return this.call<ConfirmEmailParam>('auth/confirm-email', { email, token });
  }

  public sendNewPassword(email: string, password: string, token: string): Observable<ChangePasswordWithPasswordResult> {
    return this.call<ChangePasswordWithPasswordParam>('auth/change-password', { email, password, token });
  }
}
