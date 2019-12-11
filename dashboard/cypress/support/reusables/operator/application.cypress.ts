import { closeNotification } from '../notification.cypress';
import { operatorStubs } from '../../stubs/operator/operator.list';
import { operatorStub } from '../../stubs/operator/operator.find';
import { CypressExpectedApplication } from '../../expectedApiPayload/expectedApplication';

export function cypress_applications(e2e = false) {
  it('navigates to application', () => {
    cy.get('.Header-user').click();
    cy.get('.mat-menu-item:nth-child(1)').click();
    cy.get('.mat-tab-link:nth-child(4)').click();
  });

  it('creates application', () => {
    cy.get('.operatorToken-add button').click();
    cy.get('.operatorToken-add input').type(CypressExpectedApplication.get().name);
    cy.get('app-application-form button:first-child').click();

    if (!e2e) {
      cy.wait('@applicationCreate').then((xhr) => {
        const params = xhr.request.body;

        const expectedParams = {
          ...CypressExpectedApplication.get(),
          owner_id: operatorStub._id,
          permissions: ['journey.create'],
        };

        expect(params).eql(expectedParams);
      });
    }
  });

  // close creation success notif
  closeNotification();

  it('copy token', () => {
    cy.get('.token button').click();
    // click on notif fix bug
    cy.wait(500);
  });

  // close copy success notif
  closeNotification();

  it('closes window', () => {
    cy.get('.mat-dialog-actions button').click();
  });

  if (e2e) {
    it('check created item is at top', () => {
      cy.get('app-list-item:first-child .operatorToken-list-item-name').contains(CypressExpectedApplication.get().name);
    });
  }

  it('revoke application', () => {
    cy.get('app-list-item:first-child .operatorToken-list-item-actions a').click();
    cy.get('mat-dialog-actions button:nth-child(2)').click();
    if (!e2e) {
      cy.wait('@applicationRevoke').then((xhr) => {
        const params = xhr.request.body[0].params;
        const method = xhr.request.body[0].method;

        expect(method).equal('application:revoke');

        expect(params).eql({
          uuid: CypressExpectedApplication.getAfterCreate().uuid,
        });
      });
    }
  });

  // close revoke confirm notification
  closeNotification();
}
