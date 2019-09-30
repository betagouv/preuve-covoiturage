import { environment } from '../../src/environments/environment';
import { testTerritoryPath } from '../support/paths/territory.path';

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

  testTerritoryPath(true);
});
