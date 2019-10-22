import { territoryE2EStory } from '../support/stories/territory.e2e.story';
import { operatorE2EStory } from '../support/stories/operator.e2e.story';
import { registryE2EStory } from '../support/stories/registry.e2e.story';

context('E2E', () => {
  if (!Cypress.env('ENV_NAME') || Cypress.env('ENV_NAME') !== 'local') {
    return;
  }
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
