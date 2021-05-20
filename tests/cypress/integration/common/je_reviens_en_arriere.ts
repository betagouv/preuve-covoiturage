import { Then } from 'cypress-cucumber-preprocessor/steps';

Then(`je reviens en arrière`, function () {
  cy.go('back');
});
