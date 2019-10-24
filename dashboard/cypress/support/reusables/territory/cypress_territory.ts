/// <reference types="Cypress" />
import { Territory } from '~/core/entities/territory/territory';

import { expectedPatchedTerritory } from '../../apiValues/expectedTerritory';
import { closeNotification } from '../notification.cypress';

export function cypress_territory(oldValue: Territory, e2e = false) {
  it('navigate to territory', () => {
    cy.get('.Header-user').click();
    cy.get('.mat-menu-item:nth-child(1)').click();
    cy.get('.mat-tab-link:nth-child(2)').click();
  });

  if (!e2e) {
    it('check values : name', () => {
      cy.get('.territory-name').contains(oldValue.name);
    });
  }

  it('change values of dpo : firstname & name', () => {
    cy.get('.contacts > div:nth-child(1) .formContact-firstname input')
      .clear()
      .type(expectedPatchedTerritory.contacts.gdpr_dpo.firstname);
    cy.get('.contacts > div:nth-child(1) .formContact-lastname input')
      .clear()
      .type(expectedPatchedTerritory.contacts.gdpr_dpo.lastname);
    cy.get('.contacts > div:nth-child(1) .formContact-email input')
      .clear()
      .type(expectedPatchedTerritory.contacts.gdpr_dpo.email);
  });

  it('clicks on save', () => {
    cy.get('.territoryForm button').click();

    if (!e2e) {
      cy.wait('@territoryPatchContacts').then((xhr) => {
        const params = xhr.request.body[0].params;
        const method = xhr.request.body[0].method;

        expect(method).equal('territory:patchContacts');

        expect(params).eql({
          patch: expectedPatchedTerritory.contacts,
          _id: expectedPatchedTerritory._id,
        });
      });
    }
  });

  closeNotification();
}
