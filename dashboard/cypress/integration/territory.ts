/// <reference types="Cypress" />

import { stubCampaignList } from '../support/stubs/campaign.list';
import { Cypress_login } from '../support/reusables/cypress_login';
import { Cypress_campaignCreate } from '../support/reusables/cypress_campaign-create';
import { stubOperatorList } from '../support/stubs/operator.list';
import { stubCampaignTemplateList } from '../support/stubs/campaign-template.list';
import { Cypress_filterTrips } from '../support/reusables/filter-trips.spec';
import { stubTripList } from '../support/stubs/trip.list';
import { stubStatList } from '../support/stubs/stat.list';

context('TERRITORY', () => {
  beforeEach(() => {
    cy.server();
    stubCampaignList();
    stubOperatorList();
    stubCampaignTemplateList();
    stubTripList();
    stubStatList();
  });

  it('go to login page', () => {
    cy.visit('/login');
  });

  Cypress_login('territory@example.com', 'admin1234');

  // TEST FILTERS
  describe('filter form', () => {
    it('clicks list tab', () => {
      cy.get('.TripLayout .mat-tab-link-container .mat-tab-links a:nth-child(2)').click();
    });
    Cypress_filterTrips();
  });

  // TEST CAMPAIGNS
  describe('Create new campaign', () => {
    it('clicks on campaign section', () => {
      cy.get('.Header-menu .Header-menu-item:first-child').click();
    });

    it('clicks button to create new campaign', () => {
      cy.get('.CampaignDashboard-trips-header button').click();
    });

    Cypress_campaignCreate();
  });
});
