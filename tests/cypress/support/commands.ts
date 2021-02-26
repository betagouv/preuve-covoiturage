import { formInputsSelectors } from './elementsSelectors';

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

const loginFormInputsSelectors = formInputsSelectors.get('le formulaire de connexion');
const emailInputSelector = loginFormInputsSelectors.get('email');
const passwordInputSelector = loginFormInputsSelectors.get('mot de passe');
const submitButtonSelector = loginFormInputsSelectors.get('boutton connexion');

Cypress.Commands.add('login', (email, password) => {
  cy.clearCookies();
  cy.intercept('POST', '/login').as('loginRequest');

  cy.visit('/');

  cy.get(emailInputSelector).type(email).should('have.value', email);

  cy.get(passwordInputSelector).type(password).should('have.value', password);

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
