import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserRoleEnum } from '~/core/enums/user/user-role.enum';

import { stubUserCreate } from '../../stubs/user/user.create';
import { territoryStub } from '../../stubs/territory/territory.find';
import { expectedNewUsers } from '../../expectedApiPayload/expectedUser';

export function cypress_addUser(group: UserGroupEnum, e2e = false): void {
  const userData = expectedNewUsers[group];

  cy.get('.Users-add > button').click();
  cy.wait(500);

  // firstname
  cy.get('.CreateEditUserForm > mat-form-field:first-child input').type(userData.firstname);

  // lastname
  cy.get('.CreateEditUserForm >mat-form-field:nth-child(2) input').type(userData.lastname);

  // email
  cy.get('.CreateEditUserForm > mat-form-field:nth-child(3) input').type(userData.email);

  // phone
  cy.get('.CreateEditUserForm > mat-form-field:nth-child(4) input').type(userData.phone);

  // click role
  cy.get('mat-form-field:nth-child(5)').click();
  cy.wait(500);

  const groupIndex =
    userData.role === UserRoleEnum.TERRITORY_ADMIN
      ? 1
      : userData.role === UserRoleEnum.OPERATOR_ADMIN
      ? 2
      : userData.role === UserRoleEnum.REGISTRY_ADMIN
      ? 3
      : 0;

  cy.get(`.mat-select-panel mat-option:nth-child(${groupIndex})`).click();

  const roleIndex =
    userData.role === UserRoleEnum.REGISTRY_ADMIN
      ? 2
      : userData.role === UserRoleEnum.OPERATOR_ADMIN
      ? 2
      : userData.role === UserRoleEnum.TERRITORY_ADMIN
      ? 2
      : 1;

  // select group

  cy.get('mat-form-field:nth-child(6)').click();

  cy.get(`.mat-select-panel mat-option:nth-child(${roleIndex})`).click();

  cy.wait(500);

  // select operator
  if (userData.role.split('.')[0] === 'operator') {
    if (e2e) {
      cy.get('app-operator-autocomplete mat-form-field input').click();
    } else {
      cy.get('app-operator-autocomplete mat-form-field input').type('opé');
    }
    cy.wait(500);
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();
    cy.wait(500);
  }

  if (userData.role.split('.')[0] === 'territory') {
    // select territory
    cy.get('app-territory-autocomplete mat-form-field input').type(e2e ? 'a' : territoryStub.name);
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();
    cy.wait(500);
  }

  if (!e2e) {
    stubUserCreate(group);
  }

  cy.get('.CreateEditUserForm-actions > button:first-child').click();
  cy.wait(500);

  if (!e2e) {
    cy.wait('@userCreate').then((xhr) => {
      const params = xhr.request.body[0].params;
      const method = xhr.request.body[0].method;

      expect(method).equal('user:create');

      expect(params).eql(userData);
    });
  }
}
