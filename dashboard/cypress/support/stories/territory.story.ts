import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_login } from '../reusables/auth/cypress_login';
import { cypress_filter } from '../reusables/filter/cypress_filter';
import { cypress_campaignCreate } from '../reusables/campaign/cypress_campaign_create';
import { cypress_campaignEdit } from '../reusables/campaign/cypress_campaign_edit';
import { cypress_campaignLaunch } from '../reusables/campaign/cypress_campaign_launch';
import { cypress_territory } from '../reusables/territory/cypress_territory';
import { territoryStub } from '../stubs/territory/territory.find';
import { cypress_profile } from '../reusables/profile/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_logout } from '../reusables/auth/cypress_logout';

export function testTerritoryStory() {
  it('go to login page', () => {
    cy.visit('/login');
  });

  it('Logges in', () => {
    cypress_login('territory@example.com', 'admin1234');
  });

  // TEST PROFILE UPDATE
  describe('Profile update', () => {
    cypress_profile(cypress_logging_users.territories);
  });

  // TEST TERRITORY UPDATE
  describe('Territory update', () => {
    cypress_territory(territoryStub);
  });

  // TEST FILTERS
  describe('Filter trips', () => {
    cypress_filter(false, UserGroupEnum.TERRITORY);
  });

  // TEST CAMPAIGNS
  describe('Create new campaign', () => {
    cypress_campaignCreate();
  });

  describe('Edit campaign', () => {
    cypress_campaignEdit();
  });

  describe('Launch campaign', () => {
    cypress_campaignLaunch();
  });

  // LOGOUT
  describe('Logout', () => {
    cypress_logout();
  });
}
