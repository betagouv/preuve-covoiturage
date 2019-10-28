import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_login } from '../reusables/auth/cypress_login';
import { cypress_filter } from '../reusables/filter/cypress_filter';
import { cypress_profile } from '../reusables/profile/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_logout } from '../reusables/auth/cypress_logout';
import { cypress_operator } from '../reusables/operator/cypress_operator';
import { operatorStub } from '../stubs/operator/operator.find';
import { cypress_users } from '../reusables/user/users.cypress';

export function testRegistryStory(profile = true, filters = true, users = true) {
  // PROFILE UPDATE
  if (profile) {
    describe('Profile update', () => {
      cypress_profile(cypress_logging_users.registry);
    });
  }

  // FILTERS
  if (filters) {
    describe('Filter trips', () => {
      cypress_filter(false, UserGroupEnum.REGISTRY);
    });
  }

  // // USERS
  // if (users) {
  //   describe('Manage users', () => {
  //     cypress_users();
  //   });
  // }

  // LOGOUT
  describe('Logout', () => {
    cypress_logout();
  });
}
