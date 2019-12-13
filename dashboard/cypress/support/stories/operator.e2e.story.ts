import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_login } from '../reusables/auth/cypress_login';
import { cypress_filter } from '../reusables/filter/cypress_filter';
import { cypress_profile } from '../reusables/profile/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_logout } from '../reusables/auth/cypress_logout';
import { cypress_operator } from '../reusables/operator/cypress_operator';
import { operatorStub } from '../stubs/operator/operator.find';
import { cypress_applications } from '../reusables/operator/application.cypress';
import { TestsInterface } from '../../config/tests.interface';

export function operatorE2EStory(config: TestsInterface['operator']) {
  cypress_login(
    {
      email: 'operator@example.com',
      password: 'admin1234',
      group: UserGroupEnum.OPERATOR,
    },
    true,
  );

  if (config.profile) {
    // PROFILE
    describe('Profile update', () => {
      cypress_profile(cypress_logging_users.operators, true);
    });
  }

  if (config.operator) {
    // OPERATOR
    describe('Operator update', () => {
      cypress_operator(operatorStub, true);
    });
  }

  if (config.applications) {
    // APPLICATIONS
    describe('Applications', () => {
      cypress_applications(true);
    });
  }

  if (config.filters) {
    // FILTERS
    describe('Filter trips', () => {
      cypress_filter(true, UserGroupEnum.OPERATOR);
    });
  }

  // LOGOUT
  describe('Logout', () => {
    cypress_logout();
  });
}
