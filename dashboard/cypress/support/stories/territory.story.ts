import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_login } from '../reusables/cypress_login';
import { cypress_filterTrips } from '../reusables/cypress_filter-trips';
import { cypress_campaignCreate } from '../reusables/cypress_campaign_create';
import { cypress_campaignEdit } from '../reusables/cypress_campaign_edit';
import { cypress_campaignLaunch } from '../reusables/cypress_campaign_launch';
import { cypress_territory } from '../reusables/cypress_territory';
import { territoryStub } from '../stubs/territory/territory.find';
import { cypress_profile } from '../reusables/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_logout } from '../reusables/cypress_logout';

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
    cypress_filterTrips(false, UserGroupEnum.TERRITORY);
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
