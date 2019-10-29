export function testNotification() {
  it('clicks on notification', () => {
    cy.get('.toast-message').click();
  });
}
