const { formInputsSelectors } = require('./elementsSelectors.js');

const loginFormInputsSelectors = formInputsSelectors.get('le formulaire de connexion');
const emailInputSelector = loginFormInputsSelectors.get('email');
const passwordInputSelector = loginFormInputsSelectors.get('mot de passe');
const submitButtonSelector = loginFormInputsSelectors.get('boutton connexion');

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --

Cypress.Commands.add("login", (email, password) => {
    cy.clearCookies();
    cy.intercept('POST', '/login').as('loginRequest');

    cy.visit('/');

    cy.get(emailInputSelector)
      .type(email)
      .should('have.value', email);

    cy.get(passwordInputSelector)
      .type(password)
      .should('have.value', password);

    cy.get(submitButtonSelector.selector)
      .click();

    cy.wait('@loginRequest');

    cy.location('pathname', { timeout: 1000 })
      .should('include', '/trip/stats');

    cy.getCookie('pdc-session', { timeout: 1000 }).should('have.property', 'value');
});

//
//
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
