import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

/// <reference types="Cypress" />
import { cypress_addUser } from './addUser.cypress';
import { expectedNewUsers } from '../../apiValues/expectedUser';
import { closeNotification } from '../notification.cypress';

export function cypress_users(e2e = false) {
  it('navigate to users', () => {
    cy.get('.Header-user').click();
    cy.get('.mat-menu-item:nth-child(1)').click();
    cy.get('.mat-tab-link:nth-child(2)').click();
  });

  it('add a registry admin user', () => {
    cypress_addUser(expectedNewUsers[UserGroupEnum.REGISTRY]);
  });
  closeNotification();

  it('add a territory admin user', () => {
    cypress_addUser(expectedNewUsers[UserGroupEnum.TERRITORY]);
  });
  closeNotification();

  it('add a operator admin user', () => {
    cypress_addUser(expectedNewUsers[UserGroupEnum.OPERATOR]);
  });
  closeNotification();

  // update territory

  // update operator

  // delete user
}
