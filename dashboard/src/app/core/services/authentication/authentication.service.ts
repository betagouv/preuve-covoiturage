import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { first, map, shareReplay, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { PermissionType } from '~/core/types/permissionType';
import { User } from '~/core/entities/authentication/user';
import { JsonRPCResult } from '~/core/entities/api/jsonRPCResult';
import { UserService } from '~/modules/user/services/user.service';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserRoleEnum } from '~/core/enums/user/user-role.enum';
import { catchHttpStatus } from '~/core/operators/catchHttpStatus';

import { JsonRPCParam } from '../../entities/api/jsonRPCParam';
import { JsonRPCService } from '../api/json-rpc.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _hasChecked: boolean;

  private _user$ = new BehaviorSubject<User>(new User());
  private userMe$: Observable<User>;

  constructor(
    private userService: UserService,
    private jsonRPC: JsonRPCService,
    private router: Router,
    private toastr: ToastrService,
    private http: HttpClient,
  ) {
    this.userService.user$.subscribe((user: User) => {
      const loggedInUser = this.user;

      // if userService is updated and match current user we update its state
      if (user && loggedInUser && loggedInUser._id === user._id) {
        if (user.email !== loggedInUser.email) {
          this.logout(
            `L'email de votre compte a été modifié. ` +
              `Un lien de vérification vous a été envoyé à cette nouvelle adresse.`,
          );
        } else {
          this._user$.next(user);
        }
      }
    });

    this.userMe$ = this.jsonRPC.callOne(new JsonRPCParam('user:me')).pipe(
      map(({ data }) => {
        // if forbidden return null
        if (data.error && data.error.code === -32503) {
          return null;
        }
        return new User(data);
      }),
      catchHttpStatus(401, (err) => null),
      shareReplay(),
    );
  }

  get user$(): Observable<User> {
    return this._user$;
  }

  get user(): User {
    return this._user$.getValue();
  }

  call(url: string, payload: any, withCredentials: boolean = true): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http.post(url, payload, {
      headers,
      withCredentials,
    });
  }

  public get isAdmin(): boolean {
    return this.hasRole(UserRoleEnum.ADMIN);
  }

  public login(email: string, password: string) {
    return this.call('login', { email, password }).pipe(
      catchHttpStatus(401, (err) => null),
      map((loginPayload) => {
        if (loginPayload && loginPayload.result && loginPayload.result.data) {
          return loginPayload.result.data;
        }
        return null;
      }),
      tap((user) => {
        if (user) {
          this.onLoggin(new User(user));
          if (user.territory) {
            this.router.navigate(['/campaign']);
          } else {
            this.router.navigate(['/trip/stats']);
          }
        } else {
          this.toastr.error('Mauvais Email ou mot de passe');
        }
      }),
    );
  }

  public logout(message = 'Vous avez bien été déconnecté') {
    this.http.post('logout', {}, { withCredentials: true }).subscribe((response) => {
      this._user$.next(null);
      this.router.navigate(['/login']).then(() => {
        this.toastr.success(message);
      });
    });
  }

  public changePassword(oldPassword: string, newPassword: string): Observable<any> {
    const jsonRPCParam = new JsonRPCParam('user:changePassword', {
      old_password: oldPassword,
      new_password: newPassword,
    });

    return this.jsonRPC.callOne(jsonRPCParam).pipe(tap(console.log));
  }

  /**
   * Check if connected user has any of list of permissions
   */
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

  /**
   * Check if connected user has any of list of groups
   */
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

  /**
   * Check if connected user has role
   */
  public hasRole(role: UserRoleEnum | null): boolean {
    if (!role) {
      return true;
    }
    const user = this.user;
    if (!user) {
      return false;
    }
    return !role || ('role' in user && role === user.role);
  }

  public sendInviteEmail(user: User): Observable<JsonRPCResult> {
    return this.jsonRPC.callOne(new JsonRPCParam('user:sendInvitationEmail', { _id: user._id }));
  }

  public restorePassword(email: string, password: string, token: string): Observable<any> {
    return this.call('auth/change-password', {
      email,
      password,
      token,
    });
  }

  public sendForgottenPasswordEmail(email: string): Observable<any> {
    return this.call('auth/reset-password', { email });

    // const jsonRPCParam = new JsonRPCParam();
    // jsonRPCParam.method = 'user:forgottenPassword';
    // jsonRPCParam.params = {
    //   email,
    // };
    //
    // return this._jsonRPC.callOne(jsonRPCParam);
  }

  /**
   * Check validity of token & reset
   */
  public checkPasswordToken(email: string, token: string): Observable<any> {
    return this.call('auth/check-token', { email, token });

    // const jsonRPCParam = new JsonRPCParam();
    // jsonRPCParam.method = 'user:checkPasswordToken';
    // jsonRPCParam.params = {
    //   email,
    //   token,
    // };
    //
    // return this._jsonRPC.callOne(jsonRPCParam);
  }

  /**
   * Check validity of token & reset
   */
  public confirmEmail(email: string, token: string): Observable<any> {
    return this.call('auth/confirm-email', { email, token });

    // const jsonRPCParam = new JsonRPCParam();
    // jsonRPCParam.method = 'user:confirmEmail';
    // jsonRPCParam.params = {
    //   email,
    //   token,
    // };
    //
    // return this._jsonRPC.callOne(jsonRPCParam);
  }

  public sendNewPassword(email: string, password: string, token: string): Observable<any> {
    return this.call('auth/change-password', { email, password, token });
  }

  check(): Observable<User> {
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

  public patch(userData: any): Observable<User> {
    return this.userService.patch(userData).pipe(
      first(),
      tap((user: User) => this._user$.next(user)),
    );
  }

  private onLoggin(user: User) {
    // const redirectToStats = !this.user && user;
    this._hasChecked = true;
    this._user$.next(user);
  }
}
