import { CrudStore } from '~/core/services/store/crud-store';
import { Injectable } from '@angular/core';
import { UserApiService } from '~/modules/user/services/user-api.service';
import { User } from '~/core/entities/authentication/user';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService extends CrudStore<User, User, UserApiService> {
  constructor(protected userApi: UserApiService) {
    super(userApi, User);
  }
}
