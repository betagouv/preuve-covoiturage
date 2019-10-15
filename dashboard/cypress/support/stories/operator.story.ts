import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_login } from '../reusables/cypress_login';
import { cypress_filterTrips } from '../reusables/cypress_filter-trips';
import { cypress_profile } from '../reusables/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_logout } from '../reusables/cypress_logout';
import { cypress_operator } from '../reusables/cypress_operator';
import { operatorStub } from '../stubs/operator/operator.find';

export function testOperatorStory() {
  it('go to login page', () => {
    cy.visit('/login');
  });

  it('Logges in', () => {
    cypress_login('operator@example.com', 'admin1234');
  });

  // TEST PROFILE UPDATE
  describe('Profile update', () => {
    cypress_profile(cypress_logging_users.operators);
  });

  // TEST OPERATOR UPDATE
  describe('Operator update', () => {
    cypress_operator(operatorStub);
  });

  // TEST FILTERS
  describe('Filter trips', () => {
    cypress_filterTrips(false, UserGroupEnum.OPERATOR);
  });

  // LOGOUT
  describe('Logout', () => {
    cypress_logout();
  });
}
