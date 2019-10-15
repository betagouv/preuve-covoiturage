/// <reference types="Cypress" />
import { User } from '../../../src/app/core/entities/authentication/user';
import { expectedPatchedProfiles } from '../apiValues/expectedProfile';

export function cypress_profile(currentProfile: User, e2e = false) {
  const patchedProfile = expectedPatchedProfiles[currentProfile.group];

  it('navigate to profile', () => {
    cy.get('.Header-user').click();
    cy.get('.mat-menu-item:nth-child(1)').click();
    cy.get('.mat-tab-link:nth-child(1)').click();
  });

  it('check values : firstname, lastname, email, phone', () => {
    cy.get('input.profile-firstname ').should('have.value', currentProfile.firstname);
    cy.get('input.profile-lastname ').should('have.value', currentProfile.lastname);
    cy.get('input.profile-email ').should('have.value', currentProfile.email);
    cy.get('input.profile-phone ').should('have.value', currentProfile.phone);
  });

  it('change values : firstname, lastname', () => {
    cy.get('input.profile-firstname ')
      .clear()
      .type(patchedProfile.firstname);
    cy.get('input.profile-lastname ')
      .clear()
      .type(patchedProfile.lastname);
  });

  it('clicks on save', () => {
    cy.get('.profileForm button').click();

    if (!e2e) {
      cy.wait('@userPatch').then((xhr) => {
        const params = xhr.request.body[0].params;
        const method = xhr.request.body[0].method;

        expect(method).equal('user:patch');

        const { firstname, lastname, email, phone } = patchedProfile;

        expect(params).eql({
          patch: { firstname, lastname, email, phone },
          _id: patchedProfile._id,
        });
      });
    }
  });
}
