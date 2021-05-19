import { getFormSelectorsFromName } from './helpers/getFormSelectorsFromName';

// Must be declared global to be detected by typescript (allows import/export)
// eslint-disable @typescript/interface-name
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable<Subject> {
      login(email: string, password: string): void;
    }
  }
}

Cypress.Commands.add('login', function (email, password) {
  cy.clearCookies();
  cy.intercept('POST', '/login').as('loginRequest');
  cy.visit('/');

  const loginFormMap = getFormSelectorsFromName('le formulaire de connexion');
  const emailInputSelector = loginFormMap.get('email');
  const passwordInputSelector = loginFormMap.get('mot de passe');
  const submitButtonSelector = loginFormMap.get('bouton connexion');

  cy.get(emailInputSelector.selector).type(email).should('have.value', email);
  cy.get(passwordInputSelector.selector).type(password).should('have.value', password);
  cy.get(submitButtonSelector.selector).click();

  cy.wait('@loginRequest');

  cy.location('pathname', { timeout: 1000 }).should('include', '/trip/stats');

  cy.getCookie('pdc-session', { timeout: 1000 }).should('have.property', 'value');
});

// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
