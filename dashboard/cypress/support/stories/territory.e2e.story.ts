import { cypress_login } from '../reusables/cypress_login';
import { cypress_filterTrips } from '../reusables/cypress_filter-trips';
import { cypress_campaignCreate } from '../reusables/cypress_campaign_create';
import { cypress_campaignEdit } from '../reusables/cypress_campaign_edit';
import { cypress_campaignLaunch } from '../reusables/cypress_campaign_launch';

export function testTerritoryE2EStory() {
  it('go to login page', () => {
    cy.visit('/login');
  });

  it('Logges in', () => {
    cypress_login('territory@example.com', 'admin1234');
  });

  // TEST CAMPAIGNS
  describe('Create new campaign', () => {
    cypress_campaignCreate(true);
  });

  describe('Edit campaign', () => {
    cypress_campaignEdit(true);
  });

  describe('Launch campaign', () => {
    cypress_campaignLaunch(true);
  });

  // TEST FILTERS
  describe('Filter trips', () => {
    cypress_filterTrips(true);
  });
}
