import { closeNotification } from '../notification.cypress';

export function cypress_logout() {
  it('clicks on logout', () => {
    cy.get('.Header-user').click();
    cy.get('.mat-menu-item:nth-child(2)').click();
  });
  closeNotification();
}
