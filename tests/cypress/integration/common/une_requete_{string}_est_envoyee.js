const { Then } = require('cypress-cucumber-preprocessor/steps');
const { requests } = require('../../support/requests.js');

Then(`une requête {string} est envoyée`, (requestBinding) => {
  if (!requests.has(requestBinding)) {
    throw new Error(`Cant find request named ${requestBinding}`);
  }
  const [slug] = requests.get(requestBinding);
  const waitSlug = `@${slug}`;
  cy.wait(waitSlug);
});
