import { Then } from 'cypress-cucumber-preprocessor/steps';
import { requests } from '../../support/requests';

Then(`une requête {string} est envoyée`, function (requestBinding) {
  if (!requests.has(requestBinding)) {
    throw new Error(`Cant find request named ${requestBinding}`);
  }
  const [slug] = requests.get(requestBinding);
  const waitSlug = `@${slug}`;
  cy.wait(waitSlug);
});
