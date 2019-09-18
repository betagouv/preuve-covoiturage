export function Cypress_login(email, password) {
  it('logges in', () => {
    cy.get('.Login mat-form-field:first-child input').type(email);

    cy.get('.Login mat-form-field:nth-child(2) input').type(password);

    cy.get('.Login form > button').click();

    cy.wait(1000);
  });
}
