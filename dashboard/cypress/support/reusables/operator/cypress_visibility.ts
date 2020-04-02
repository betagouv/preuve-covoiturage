import { territoryStubs } from '../../stubs/territory/territory.list';
import { closeNotification } from '../notification.cypress';
import { CI_WAIT } from '../../../config/ci.config';

export function cypress_visibility(e2e = false): void {
  it('navigates to visibility', () => {
    cy.get('.Header-user').click();
    cy.get('.mat-menu-item:nth-child(1)').click();
    cy.get('.mat-tab-link:nth-child(5)').click();
  });

  // check display
  it('checks current selection', () => {
    for (let i = 0; i < territoryStubs.length; i += 1) {
      if (i % 2 === 0) {
        cy.get(`.OperatorVisibilityTree mat-checkbox:nth-child(${i + 1}) input`).should('be.checked');
      }
    }
  });

  // search territory
  it('search territory', () => {
    cy.get('.OperatorVisibilityTree-header > form input')
      .type(territoryStubs[1].name)
      .type('{enter}');
    cy.wait(CI_WAIT.waitLong); // searches is mat-select-panel from ranks
  });

  // save one with a change
  it('add territory', () => {
    cy.get('.OperatorVisibilityTree mat-checkbox:first-child .mat-checkbox-layout').click();
    cy.get('.OperatorVisibilityTree-actions button').click();
    cy.wait(CI_WAIT.waitLong); // searches is mat-select-panel from ranks

    if (!e2e) {
      cy.wait('@updateVisibleInTerritories').then((xhr) => {
        const method = xhr.request.body[0].method;

        expect(method).equal('territory:updateOperator');
      });
    }
  });

  closeNotification();

  // select all select none
  it('check & uncheck', () => {
    cy.get('.OperatorVisibilityTree-header > mat-checkbox .mat-checkbox-layout').click();
    cy.wait(CI_WAIT.waitShort);
    cy.get('.OperatorVisibilityTree-header > mat-checkbox .mat-checkbox-layout').click();
    cy.get('.OperatorVisibilityTree-actions button').click();

    if (!e2e) {
      cy.wait('@updateVisibleInTerritories').then((xhr) => {
        const params = xhr.request.body[0].params;
        const method = xhr.request.body[0].method;

        expect(method).equal('territory:updateOperator');
        expect(params.territory_id).eql([]);
      });
    }
  });

  closeNotification();
}
