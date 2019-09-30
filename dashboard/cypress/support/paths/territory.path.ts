import { UserGroupEnum } from '../../../src/app/core/enums/user/user-group.enum';

import { cypress_login, cypress_stub_login } from '../reusables/cypress_login';
import { cypress_filterTrips } from '../reusables/cypress_filter-trips';
import { cypress_campaignCreate } from '../reusables/cypress_campaign_create';
import { cypress_campaignEdit } from '../reusables/cypress_campaign_edit';

export function testTerritoryPath(e2e = false) {
  it('go to login page', () => {
    cy.visit('/login');
  });

  it('Logges in', () => {
    cypress_stub_login(UserGroupEnum.TERRITORY);
    cypress_login('territory@example.com', 'admin1234');
  });

  // TEST FILTERS
  describe('filter form', () => {
    it('clicks list tab', () => {
      cy.get('.TripLayout .mat-tab-link-container .mat-tab-links a:nth-child(2)').click();
    });
    cypress_filterTrips();
  });

  // TEST CAMPAIGNS
  describe('Create new campaign', () => {
    it('clicks on campaign section', () => {
      cy.get('.Header-menu .Header-menu-item:first-child').click();
    });

    it('clicks button to create new campaign', () => {
      cy.get('.CampaignDashboard-trips-header button').click();
    });

    cypress_campaignCreate();
  });

  describe('Edit campaign', () => {
    cypress_campaignEdit();
  });
}
