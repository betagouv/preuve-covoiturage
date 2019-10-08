import { cypress_login } from '../reusables/cypress_login';
import { cypress_filterTrips } from '../reusables/cypress_filter-trips';
import { cypress_campaignCreate } from '../reusables/cypress_campaign_create';
import { cypress_campaignEdit } from '../reusables/cypress_campaign_edit';
import { cypress_campaignLaunch } from '../reusables/cypress_campaign_launch';

export function testTerritoryStory() {
  it('go to login page', () => {
    cy.visit('/login');
  });

  it('Logges in', () => {
    cypress_login('territory@example.com', 'admin1234');
  });

  // TEST FILTERS
  describe('Filter trips', () => {
    cypress_filterTrips();
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
}
