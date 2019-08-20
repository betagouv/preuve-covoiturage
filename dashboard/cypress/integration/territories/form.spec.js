/// <reference types="Cypress" />

context('Update territory form', () => {
  beforeEach(() => {
    cy.visit(`/admin/territory`);
  });

  it('submit new name', () => {
    // https://on.cypress.io/type
    cy.get('.name input')
      .type('new Aom name')
      .should('have.value', 'new Aom name');

    it('submit change', () => {
      // https://on.cypress.io/submit
      cy.get('.territoryForm').submit();
    });
  });
});
