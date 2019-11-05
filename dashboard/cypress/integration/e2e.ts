import { territoryE2EStory } from '../support/stories/territory.e2e.story';
import { operatorE2EStory } from '../support/stories/operator.e2e.story';
import { registryE2EStory } from '../support/stories/registry.e2e.story';
import { stubCampaignTemplateList } from '../support/stubs/campaign/campaign-template.list';

context('E2E', () => {
  if (!Cypress.env('ENV_NAME') || Cypress.env('ENV_NAME') !== 'local') {
    return;
  }
  Cypress.Cookies.defaults({
    whitelist: 'pdc-session',
  });

  before(() => {
    cy.clearCookies();
  });

  beforeEach(() => {
    cy.server();
    cy.route({
      method: 'POST',
      url: '/rpc?methods=campaign:create',
    }).as('campaignCreate');
    // todo: TEMP in e2e until templates are in dbb
    stubCampaignTemplateList();
  });

  describe('REGISTRY - users', () => {
    registryE2EStory();
  });

  describe('TERRITORY', () => {
    territoryE2EStory();
  });

  describe('OPERATOR', () => {
    operatorE2EStory();
  });
});
