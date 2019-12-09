export function closeNotification() {
  it('clicks on notification', () => {
    cy.get('.toast-message').click();
  });
}
