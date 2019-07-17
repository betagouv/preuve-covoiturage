import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../../entities/authentication/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // tslint:disable-next-line:variable-name
  private _user$ = new BehaviorSubject<User>(null);

  constructor() {}

  set user(user: User) {
    this._user$.next(user);
  }

  get user(): User {
    return this._user$.value;
  }

  get user$(): Observable<User> {
    return this._user$;
  }
}
