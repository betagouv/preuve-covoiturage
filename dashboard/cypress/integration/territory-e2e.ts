import { environment } from '../../src/environments/environment';
import { testTerritoryStory } from '../support/stories/territory.story';

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

  testTerritoryStory(true);
});
