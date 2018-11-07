import { Injectable } from '@angular/core';
import { LocalStorage } from '@ngx-pwa/local-storage';
import {Observable} from 'rxjs';

@Injectable()
export class TokenService {
  public token: string;

  constructor( private localStorage: LocalStorage ) {}

  public set( token: string ): void {
    this.localStorage.setItem('token', token).subscribe(() => {});

  }
  public get(): Observable<any> {
    return this.localStorage.getItem<string>('token');
  }

  public clear(): void {
    this.localStorage.removeItem('token').subscribe(() => {});
  }
}
