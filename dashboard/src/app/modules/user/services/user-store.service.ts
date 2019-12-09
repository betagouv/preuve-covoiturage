import { Injectable } from '@angular/core';

import { CrudStore } from '~/core/services/store/crud-store';
import { UserApiService } from '~/modules/user/services/user-api.service';
import { User } from '~/core/entities/authentication/user';
import { UserPatchInterface } from '~/core/entities/api/shared/user/common/interfaces/UserPatchInterface';
import { UserListInterface } from '~/core/entities/api/shared/user/common/interfaces/UserListInterface';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService extends CrudStore<User, UserListInterface, UserPatchInterface, UserApiService> {
  constructor(protected userApi: UserApiService) {
    super(userApi, User);
  }
}
