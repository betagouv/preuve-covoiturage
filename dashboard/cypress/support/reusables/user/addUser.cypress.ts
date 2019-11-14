import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { UserRoleEnum } from '~/core/enums/user/user-role.enum';

import { stubUserCreate } from '../../stubs/user/user.create';
import { territoryStub } from '../../stubs/territory/territory.find';
import { expectedNewUsers } from '../../apiValues/expectedUser';

export function cypress_addUser(group: UserGroupEnum, e2e = false) {
  const userData = expectedNewUsers[group];

  cy.get('.Users-add > button').click();

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

  const roleIndex =
    userData.role === UserRoleEnum.REGISTRY_ADMIN
      ? 2
      : userData.role === UserRoleEnum.OPERATOR_ADMIN
      ? 2
      : userData.role === UserRoleEnum.TERRITORY_ADMIN
      ? 2
      : 1;

  // select group
  cy.get(`.mat-select-panel mat-option:nth-child(${roleIndex})`).click();

  // click group
  cy.get('mat-form-field:nth-child(6)').click();

  const index = userData.role.split('.')[0] === 'registry' ? 3 : userData.role.split('.')[0] === 'operator' ? 2 : 1;

  cy.wait(500);

  // select group
  cy.get(`.mat-select-panel mat-option:nth-child(${index})`).click();

  // select operator
  if (userData.role.split('.')[0] === 'operator') {
    if (e2e) {
      cy.get('app-operator-autocomplete mat-form-field input').click();
    } else {
      cy.get('app-operator-autocomplete mat-form-field input').type('opé');
    }
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();
  }

  if (userData.role.split('.')[0] === 'territory') {
    // select territory
    cy.get('app-territory-autocomplete mat-form-field input').type(e2e ? 'a' : territoryStub.name);
    cy.get('.mat-autocomplete-panel mat-option:first-child').click();
  }

  if (!e2e) {
    stubUserCreate(group);
  }

  cy.get('.CreateEditUserForm-actions > button:first-child').click();

  if (!e2e) {
    cy.wait('@userCreate').then((xhr) => {
      const params = xhr.request.body[0].params;
      const method = xhr.request.body[0].method;

      expect(method).equal('user:create');

      expect(params).eql(userData);
    });
  }
}
