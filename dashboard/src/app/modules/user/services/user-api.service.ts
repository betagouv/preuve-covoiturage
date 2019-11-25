import { JsonRpcCrud } from '~/core/services/api/json-rpc.crud';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { User } from '~/core/entities/authentication/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserApiService extends JsonRpcCrud<User> {
  constructor(http: HttpClient, router: Router, activatedRoute: ActivatedRoute) {
    super(http, router, activatedRoute, 'user');
  }
}
