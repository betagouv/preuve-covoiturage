import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { stubLogin } from '../../stubs/auth/login';
import { stubUserMe, stubUserMePermissionError } from '../../stubs/user/user.me';
import { stubMainLists } from '../../stubs/loadMainLists';
import { stubStatList } from '../../stubs/stat/stat.list';
import { stubCampaignList } from '../../stubs/campaign/campaign.list';

export function cypress_login(loginData: { email: string; password: string; group: UserGroupEnum }) {
  beforeEach(() => {
    cy.server();
    stubLogin(loginData.group);
    stubMainLists(loginData.group);
    stubStatList();
    stubCampaignList();
  });

  it('go to login page', () => {
    stubUserMePermissionError();

    cy.visit('/login');
  });

  it('Logges in', () => {
    cy.get('.Login mat-form-field:first-child input').type(loginData.email);

    cy.get('.Login mat-form-field:nth-child(2) input').type(loginData.password);

    stubUserMe(loginData.group);

    cy.get('.Login form > button').click();

    cy.wait(1000);
  });
}
