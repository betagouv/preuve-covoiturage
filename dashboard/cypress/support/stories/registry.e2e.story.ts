import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_login } from '../reusables/auth/cypress_login';
import { cypress_profile } from '../reusables/profile/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_logout } from '../reusables/auth/cypress_logout';
import { cypress_users } from '../reusables/user/users.cypress';

export function registryE2EStory() {
  it('go to login page', () => {
    cy.visit('/login');
  });

  it('Logges in', () => {
    cypress_login({
      email: 'admin@example.com',
      password: 'admin1234',
      group: UserGroupEnum.REGISTRY,
    });
  });

  // PROFILE UPDATE
  describe('Profile update', () => {
    cypress_profile(cypress_logging_users.registry, true);
  });

  // // FILTERS
  // describe('Filter trips', () => {
  //   cypress_filter(false, UserGroupEnum.REGISTRY);
  // });

  // USERS
  describe('Manage users', () => {
    cypress_users();
  });

  // LOGOUT
  describe('Logout', () => {
    cypress_logout();
  });
}
