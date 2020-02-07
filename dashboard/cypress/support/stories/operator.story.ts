import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_filter } from '../reusables/filter/cypress_filter';
import { cypress_profile } from '../reusables/profile/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_logout } from '../reusables/auth/cypress_logout';
import { cypress_operator } from '../reusables/operator/cypress_operator';
import { operatorStub } from '../stubs/operator/operator.find';
import { cypress_applications } from '../reusables/operator/application.cypress';
import { cypress_visibility } from '../reusables/operator/cypress_visibility';
import { TestsInterface } from '../../config/tests.interface';

export function testOperatorStory(config: TestsInterface['operator']) {
  // PROFILE
  if (config.profile) {
    describe('Profile update', () => {
      cypress_profile(cypress_logging_users.operators);
    });
  }

  // OPERATOR
  if (config.operator) {
    describe('Operator update', () => {
      cypress_operator(operatorStub);
    });
  }

  // APPLICATIONS
  if (config.applications) {
    describe('Applications', () => {
      cypress_applications();
    });
  }

  // VISIBILITY
  if (config.visibility) {
    describe('Visibility', () => {
      cypress_visibility();
    });
  }

  // FILTERS
  if (config.filters) {
    describe('Filter trips', () => {
      cypress_filter(false, UserGroupEnum.OPERATOR);
    });
  }
}
