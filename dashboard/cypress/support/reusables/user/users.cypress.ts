/// <reference types="Cypress" />

export function cypress_users() {
  it('navigate to users', () => {
    cy.get('.Header-user').click();
    cy.get('.mat-menu-item:nth-child(1)').click();
    cy.get('.mat-tab-link:nth-child(2)').click();
  });
}
