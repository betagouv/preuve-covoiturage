/* tslint:disable:no-empty */
import { Injectable } from '@angular/core';

@Injectable()
export class TokenService {
  static set(token: string): void {
    localStorage.setItem('token', token);
  }
  static get(): string {
    return localStorage.getItem('token');
  }

  static clear(): void {
    localStorage.removeItem('token');
  }
}
