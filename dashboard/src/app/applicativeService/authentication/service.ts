import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { ApiResponse } from '~/entities/responses/apiResponse';

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

  logout(returnHome = false) {
    // clear token remove user from local storage to log user out
    TokenService.clear();
    Logged.set(false);
    if (returnHome) {
      this.router.navigate(['/signin']);
    }
    return this;
  }

  getUser() {
    if (null === this.user) {
      this.user = JSON.parse(localStorage.getItem('user'));
      return this.user;
    }
    return this.user;
  }

  setUser(user: any) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearUser() {
    localStorage.removeItem('user');
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
