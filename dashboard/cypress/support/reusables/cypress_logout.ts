export function cypress_logout() {
  it('clicks on logout', () => {
    cy.wait(3000);
    cy.get('.Header-user').click();
    cy.get('.mat-menu-item:nth-child(2)').click();
  });
}
