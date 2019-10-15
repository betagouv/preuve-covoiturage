import { Operator } from '~/core/entities/operator/operator';

import { expectedPatchedOperator } from '../apiValues/expectedOperator';

export function cypress_operator(oldValue: Operator, e2e = false) {
  it('navigate to operator', () => {
    cy.wait(3000);
    cy.get('.Header-user').click();
    cy.get('.mat-menu-item:nth-child(1)').click();
    cy.get('.mat-tab-link:nth-child(2)').click();
  });

  it('check values : commercial name', () => {
    cy.get('p.nom-commercial').contains(oldValue.nom_commercial);
  });

  it('change values of dpo : firstname & name', () => {
    cy.get('.contacts > div:nth-child(1) .formContact-firstname input')
      .clear()
      .type(expectedPatchedOperator.contacts.gdpr_dpo.firstname);
    cy.get('.contacts > div:nth-child(1) .formContact-lastname input')
      .clear()
      .type(expectedPatchedOperator.contacts.gdpr_dpo.lastname);
    cy.get('.contacts > div:nth-child(1) .formContact-email input')
      .clear()
      .type(expectedPatchedOperator.contacts.gdpr_dpo.email);
  });

  it('clicks on save', () => {
    cy.get('.operatorForm button').click();

    if (!e2e) {
      cy.wait('@operatorPatchContacts').then((xhr) => {
        const params = xhr.request.body[0].params;
        const method = xhr.request.body[0].method;

        expect(method).equal('operator:patchContacts');

        const _id = expectedPatchedOperator._id;

        expect(params).eql({
          _id,
          patch: expectedPatchedOperator.contacts,
        });
      });
    }
  });
}
