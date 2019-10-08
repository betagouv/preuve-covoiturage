import { UserGroupEnum } from './../../src/app/core/enums/user/user-group.enum';

import { stubCampaignList } from '../support/stubs/campaign.list';
import { stubStatList } from '../support/stubs/stat.list';
import { stubTripList } from '../support/stubs/trip.list';
import { stubOperatorList } from '../support/stubs/operator.list';
import { cypress_login, cypress_stub_login } from '../support/reusables/cypress_login';
import { stubUserMe } from '../support/stubs/user.me';
import { stubTerritoryList } from '../support/stubs/territory.list';

context('OPERATOR', () => {
  beforeEach(() => {
    cy.server();
    stubCampaignList();
    stubOperatorList();
    stubTerritoryList();
    stubTripList();
    stubStatList();
    stubUserMe(UserGroupEnum.OPERATOR);
  });

  it('go to login page', () => {
    cy.visit('/login');
  });

  it('Logges in', () => {
    cypress_stub_login(UserGroupEnum.OPERATOR);
    cypress_login('operator@example.com', 'admin1234');
  });
});
