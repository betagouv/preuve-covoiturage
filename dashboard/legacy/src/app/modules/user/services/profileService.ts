import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ProfileService {
  constructor(private http: HttpClient) {}

  public postPassword(passwords: object): any {
    return this.http.post('/profile/password', {
      old: passwords['password'],
      new: passwords['newPassword'],
    });
  }
}
