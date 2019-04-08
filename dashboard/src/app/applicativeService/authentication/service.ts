import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { ApiResponse } from '~/entities/responses/apiResponse';
import { User } from '~/entities/database/user/user';

import { TokenService } from '../token/service';
import { Logged } from '../authguard/logged';
import { LoggerService } from '../logger/service';


@Injectable()
export class AuthenticationService {
  private user = null;
  private endPoint = '/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
    private loggerService: LoggerService,
  ) {
    this.loggerService = loggerService;
  }

  check(): boolean {
    return !!this.getUser();
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post(`${this.endPoint}/signin`, { email, password }).pipe(
      map((response: ApiResponse) => this.loginResponse(response.data)),
    );
  }

  loginResponse(response: object) {
    const token = response && response['token'];
    const error = response && response['error'];
    const user = response && response['user'];

    if (error) {
      return error;
    }

    if (!token || !user) {
      return false;
    }

    this.setUser(user);
    TokenService.set(token);
    Logged.set(true);
    return true;
  }


  hasAnyGroup(groups: string[]): string {
    const user = this.getUser();
    if (!user) return null;

    // no groups mean all
    if (!groups.length) {
      return user.group;
    }

    if (user && groups.includes(user.group)) {
      Logged.set(true);
      return user.group;
    }

    return null;
  }

  hasPermission(permission: string): boolean {
    const user = this.getUser();

    if (user && user.permissions.includes(permission)) {
      return true;
    }

    return false;
  }

  hasRole(role: string): boolean {
    const user = this.getUser();

    if (user && user.role === role) {
      return true;
    }

    return false;
  }

  logout(returnToHome: boolean = false) {
    this.clearUser();
    TokenService.clear();
    Logged.set(false);
    if (returnToHome) {
      this.router.navigate(['/signin']);
    }

    return this;
  }

  // make sure the user is still in the localStorage
  // do not user this.user to get it, so it logs the user
  // out when the localStorage user key is missing
  getUser(): User {
    try {
      this.user = JSON.parse(localStorage.getItem('user'));
      this.user.fullName = `${this.user.firstname} ${this.user.lastname}`.trim();

      return this.user;
    } catch (e) {
      return null;
    }
  }

  setUser(user: any) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearUser() {
    localStorage.removeItem('user');
  }

  getCompany() {
    const user = this.getUser();
    if (!user) return {};

    if (user.company && user.company.name) {
      switch (user.group) {
        case 'operators' :
          user.company.link = '/dashboard/operators/settings';
          user.company.icon = 'tablet';
          break;
        case 'aom' :
          user.company.link = '/dashboard/aoms/settings';
          user.company.icon = 'home';
          break;
        default:
          break;
      }
    }

    return user.company || {};
  }

  sendEmailForPasswordReset(email: string) {
    return this.http.post(`${this.endPoint}/forgotten`, { email });
  }

  postNewPassword(reset: string, token: string, password: string) {
    return this.http.post(`${this.endPoint}/reset`, { reset, token, password });
  }

  checkPasswordToken(reset: string, token: string) {
    return this.http.post(`${this.endPoint}/reset`, { reset, token });
  }

  checkEmailToken(reset: string, token: string) {
    return this.http.post(`${this.endPoint}/confirm`, { reset, token });
  }
}
