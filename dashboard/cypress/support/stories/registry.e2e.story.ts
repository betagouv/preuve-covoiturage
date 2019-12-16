import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_login } from '../reusables/auth/cypress_login';
import { cypress_profile } from '../reusables/profile/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_logout } from '../reusables/auth/cypress_logout';
import { cypress_users } from '../reusables/user/users.cypress';
import { cypress_filter } from '../reusables/filter/cypress_filter';
import { TestsInterface } from '../../config/tests.interface';

export function registryE2EStory(config: TestsInterface['registry']) {
  cypress_login(
    {
      email: 'admin@example.com',
      password: 'admin1234',
      group: UserGroupEnum.REGISTRY,
    },
    true,
  );

  if (config.profile) {
    // PROFILE UPDATE
    describe('Profile update', () => {
      cypress_profile(cypress_logging_users.registry, true);
    });
  }

  if (config.filters) {
    // FILTERS
    describe('Filter trips', () => {
      cypress_filter(true, UserGroupEnum.REGISTRY);
    });
  }

  if (config.users) {
    // USERS
    describe('Manage users', () => {
      cypress_users(true);
    });
  }

  // LOGOUT
  describe('Logout', () => {
    cypress_logout();
  });
}
