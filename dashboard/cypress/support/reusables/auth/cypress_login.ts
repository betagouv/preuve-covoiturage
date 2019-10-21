import { stubLogin } from '../../stubs/auth/login';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

export function cypress_stub_login(type: UserGroupEnum) {
  cy.server();
  stubLogin(type);
}

export function cypress_login(email, password) {
  cy.get('.Login mat-form-field:first-child input').type(email);

  cy.get('.Login mat-form-field:nth-child(2) input').type(password);

  cy.get('.Login form > button').click();

  cy.wait(1000);
}
