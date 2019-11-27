import { CrudStore } from '~/core/services/store/crud-store';
import { Injectable } from '@angular/core';
import { UserApiService } from '~/modules/user/services/user-api.service';
import { User } from '~/core/entities/authentication/user';
import { Operator } from '~/core/entities/operator/operator';
import { ParamsInterface } from '~/core/entities/api/shared/user/patch.contract';
import { UserPatchInterface } from '~/core/entities/api/shared/user/common/interfaces/UserPatchInterface';

@Injectable({
  providedIn: 'root',
})
export class UserStoreService extends CrudStore<User, User, UserPatchInterface, UserApiService> {
  constructor(protected userApi: UserApiService) {
    super(userApi, User);
  }
}
