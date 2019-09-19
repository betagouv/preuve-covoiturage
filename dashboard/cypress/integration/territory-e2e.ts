import { UserGroupEnum } from '../../src/app/core/enums/user/user-group.enum';

import { stubCampaignList } from '../support/stubs/campaign.list';
import { cypress_login, cypress_stub_login } from '../support/reusables/cypress_login';
import { cypress_campaignCreate } from '../support/reusables/cypress_campaign_create';
import { stubOperatorList } from '../support/stubs/operator.list';
import { stubCampaignTemplateList } from '../support/stubs/campaign-template.list';
import { Cypress_filterTrips } from '../support/reusables/filter-trips.spec';
import { stubTripList } from '../support/stubs/trip.list';
import { stubStatList } from '../support/stubs/stat.list';
import { stubUserMe } from '../support/stubs/user.me';
import { campaignStub } from '../support/stubs/campaign.create';

context('TERRITORY', () => {
  Cypress.Cookies.defaults({
    whitelist: 'pdc-session',
  });

  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'POST',
      url: '/rpc?methods=campaign:create',
    }).as('campaignCreate');
  });

  it('go to login page', () => {
    cy.visit('/login');
  });

  it('Logges in', () => {
    // cypress_stub_login(UserGroupEnum.TERRITORY);
    cypress_login('territory@example.com', 'admin1234');
  });

  // // TEST FILTERS
  // describe('filter form', () => {
  //   it('clicks list tab', () => {
  //     cy.get('.TripLayout .mat-tab-link-container .mat-tab-links a:nth-child(2)').click();
  //   });
  //   Cypress_filterTrips();
  // });

  // TEST CAMPAIGNS
  describe('Create new campaign', () => {
    it('clicks on campaign section', () => {
      cy.get('.Header-menu .Header-menu-item:first-child').click();
    });

    it('clicks button to create new campaign', () => {
      cy.get('.CampaignDashboard-trips-header button').click();
    });

    cypress_campaignCreate();

    // cypress_campaignEditAndLauch();
  });
});
