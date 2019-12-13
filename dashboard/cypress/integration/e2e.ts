import { territoryE2EStory } from '../support/stories/territory.e2e.story';
import { operatorE2EStory } from '../support/stories/operator.e2e.story';
import { registryE2EStory } from '../support/stories/registry.e2e.story';
import { DEBUG_CONFIG } from '../config/debug.config';
import { CI_CONFIG } from '../config/ci.config';

const isLocal = Cypress.env('ENV_NAME') && Cypress.env('ENV_NAME') === 'local';
const config = isLocal ? DEBUG_CONFIG.e2e : CI_CONFIG.e2e;

/*

  E2E requires users for registry, operator and territory :

  admin@example.com / admin1234
  territory@example.com / admin1234
  operator@example.com / admin1234

 */

context('E2E', () => {
  Cypress.Cookies.defaults({
    whitelist: 'pdc-session',
  });

  before(() => {
    cy.clearCookies();
  });

  describe('REGISTRY', () => {
    if (!('registry' in config)) {
      return;
    }
    registryE2EStory(config.registry);
  });

  describe('TERRITORY', () => {
    if (!('territory' in config)) {
      return;
    }
    territoryE2EStory(config.territory);
  });

  describe('OPERATOR', () => {
    if (!('operator' in config)) {
      return;
    }
    operatorE2EStory(config.operator);
  });
});
