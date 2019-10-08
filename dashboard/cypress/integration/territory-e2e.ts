import { environment } from '../../src/environments/environment';
import { testTerritoryE2EStory } from '../support/stories/territory.e2e.story';

context('TERRITORY E2E', () => {
  if (environment.name !== 'local') {
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

  testTerritoryE2EStory();
});
