import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_filter } from '../reusables/filter/cypress_filter';
import { cypress_profile } from '../reusables/profile/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_logout } from '../reusables/auth/cypress_logout';
import { cypress_operator } from '../reusables/operator/cypress_operator';
import { operatorStub } from '../stubs/operator/operator.find';
import { cypress_applications } from '../reusables/operator/application.cypress';
import { cypress_visibility } from '../reusables/operator/cypress_visibility';

export function testOperatorStory(
  profile = true,
  operator = true,
  applications = true,
  filters = true,
  visibility = true,
) {
  // PROFILE
  if (profile) {
    describe('Profile update', () => {
      cypress_profile(cypress_logging_users.operators);
    });
  }

  // OPERATOR
  if (operator) {
    describe('Operator update', () => {
      cypress_operator(operatorStub);
    });
  }

  // APPLICATIONS
  if (applications) {
    describe('Applications', () => {
      cypress_applications();
    });
  }

  // VISIBILITY
  if (visibility) {
    describe('Visibility', () => {
      cypress_visibility();
    });
  }

  // FILTERS
  if (filters) {
    describe('Filter trips', () => {
      cypress_filter(false, UserGroupEnum.OPERATOR);
    });
  }

  // LOGOUT
  describe('Logout', () => {
    cypress_logout();
  });
}
