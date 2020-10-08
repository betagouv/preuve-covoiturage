import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { PermissionType } from '~/core/types/permissionType';
import { User } from '~/core/entities/authentication/user';
import { JsonRPCResult } from '~/core/entities/api/jsonRPCResult';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserManyRoleEnum, UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';
import { UserApiService } from '~/modules/user/services/user-api.service';
import { UserStoreService } from '~/modules/user/services/user-store.service';

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
  private _hasChecked: boolean;

  private _user$ = new BehaviorSubject<User>(null);
  private userMe$: Observable<User>;

  constructor(
    private userApiService: UserApiService,
    private userStoreService: UserStoreService,
    private jsonRPC: JsonRPCService,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
  ) {
    this.userStoreService.entity$.subscribe((user: User) => {
      const loggedInUser = this.user;
      // if userService is updated and match current user we update its state
      if (user && loggedInUser && loggedInUser._id === user._id) {
        if (user.email !== loggedInUser.email) {
          this.logout(
            "L'email de votre compte a été modifié. " +
              'Un lien de vérification vous a été envoyé à cette nouvelle adresse.',
          );
        } else {
          this._user$.next(user);
        }
      }
    });

    this.userMe$ = this.userApiService.me();
  }

  get user$(): Observable<User> {
    return this._user$;
  }

  get user(): User {
    return this._user$.getValue();
  }

  call<T = any>(url: string, payload: T, withCredentials = true): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(url, payload, {
      headers,
      withCredentials,
    });
  }

  public get isAdmin(): boolean {
    return this.hasRole(UserManyRoleEnum.ADMIN);
  }

  public get isDemo(): boolean {
    return this.user.role === UserRoleEnum.TERRITORY_DEMO;
  }

  public login(email: string, password: string): Observable<LoginResult> {
    return this.call<LoginParam>('login', { email, password }).pipe(
      // bypass 401 errors
      catchHttpStatus(401, () => null),
      map((loginPayload) => {
        if (loginPayload && loginPayload.result && loginPayload.result.data) {
          return loginPayload.result.data;
        }
        return null;
      }),
      tap((user) => {
        if (user) {
          this.onLoggin(new User(user));
          this.toastr.clear();
          if (user.territory_id) {
            this.router.navigate(['/campaign']);
          } else {
            this.router.navigate(['/trip/stats']);
          }
        } else {
          this.toastr.error('Mauvais email ou mot de passe');
        }
      }),
    );
  }

  public logout(message = 'Vous avez bien été déconnecté'): void {
    this.http.post('logout', {}, { withCredentials: true }).subscribe((response) => {
      this._user$.next(null);
      this.router.navigate(['/login']).then(() => {
        this.toastr.success(message);
      });
    });
  }

  public changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const jsonRPCParam = new JsonRPCParam<ChangePasswordParam>('user:changePassword', {
      old_password: oldPassword,
      new_password: newPassword,
    });

    return this.jsonRPC.callOne(jsonRPCParam);
  }

  public hasAnyPermission(permissions: PermissionType[]): boolean {
    const user = this.user;
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

  public hasAnyPermissionObs(permissions: PermissionType[]): Observable<boolean> {
    return this.user$.pipe(map((user) => this.hasAnyPermission(permissions)));
  }

  public hasAnyGroup(groups: UserGroupEnum[] | null = null): boolean {
    const user = this.user;
    if (!groups && user) {
      return true;
    }

    if (!user) {
      return false;
    }
    return !groups.length || ('group' in user && groups.includes(user.group));
  }

  public hasRole(role: UserRoleEnum | UserManyRoleEnum): boolean {
    if (!role) {
      return true;
    }
    const user = this.user;
    if (!user) {
      return false;
    }
    return !role || ('role' in user && user.role.indexOf(role) !== -1);
  }

  public sendInviteEmail(user: User): Observable<JsonRPCResult> {
    return this.jsonRPC.callOne(
      new JsonRPCParam<SendInviteEmailParam>('user:sendInvitationEmail', { _id: user._id }),
    );
  }

  public sendForgottenPasswordEmail(email: string): Observable<ForgottenPasswordResult> {
    return this.call<ForgottenPasswordParam>('auth/reset-password', { email });
  }

  /**
   * Check validity of token & reset
   */
  public checkPasswordToken(email: string, token: string): Observable<ForgottenPasswordTokenResult> {
    return this.call<ForgottenPasswordTokenParam>('auth/check-token', { email, token });
  }

  /**
   * Check validity of token & reset
   */
  public confirmEmail(email: string, token: string): Observable<ConfirmEmailResult> {
    return this.call<ConfirmEmailParam>('auth/confirm-email', { email, token });
  }

  public sendNewPassword(email: string, password: string, token: string): Observable<ChangePasswordWithPasswordResult> {
    return this.call<ChangePasswordWithPasswordParam>('auth/change-password', { email, password, token });
  }

  public check(): Observable<User> {
    if (this._hasChecked) {
      return of(this._user$.value);
    }

    return this.userMe$.pipe(
      tap((user) => {
        this._hasChecked = true;
        if (user) this.onLoggin(user);
      }),
    );
  }

  private onLoggin(user: User): void {
    this._hasChecked = true;
    this._user$.next(user);
  }
}
