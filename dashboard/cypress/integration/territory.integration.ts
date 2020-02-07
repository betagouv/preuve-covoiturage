import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { stubCampaignList } from '../support/stubs/campaign/campaign.list';
import { stubStatList } from '../support/stubs/stat/stat.list';
import { stubTripList } from '../support/stubs/trip/trip.list';
import { stubOperatorList } from '../support/stubs/operator/operator.list';
import { stubUserMe } from '../support/stubs/user/user.me';
import { stubTerritoryList } from '../support/stubs/territory/territory.list';
import { TripGenerator } from '../support/generators/trips.generator';
import { stubLogout } from '../support/stubs/auth/logout';
import { stubUserPatch } from '../support/stubs/user/user.patch';
import { stubMainLists } from '../support/stubs/loadMainLists';
import { stubLogin } from '../support/stubs/auth/login';
import { stubCampaignCreate } from '../support/stubs/campaign/campaign.create';
import { stubCampaignPatch } from '../support/stubs/campaign/campaign.patch';
import { stubCampaignLaunch } from '../support/stubs/campaign/campaign.launched';
import { stubTerritoryPatchContacts } from '../support/stubs/territory/territory.patchContacts';
import { testTerritoryStory } from '../support/stories/territory.story';
import { cypress_login } from '../support/reusables/auth/cypress_login';
import { stubApiAdress } from '../support/stubs/external/api-adresse';
import { stubTripExport } from '../support/stubs/trip/trip.export';
import { DEBUG_CONFIG } from '../config/debug.config';
import { CI_CONFIG } from '../config/ci.config';
import { cypress_logout } from '../support/reusables/auth/cypress_logout';

const isLocal = Cypress.env('ENV_NAME') && Cypress.env('ENV_NAME') === 'local';

const config = isLocal ? DEBUG_CONFIG.integration : CI_CONFIG.integration;

context('TERRITORY', () => {
  if (!('territory' in config)) {
    return;
  }

  const trips = TripGenerator.generateTrips();

  describe('login', () => {
    cypress_login({
      email: 'admin@example.com',
      password: 'admin1234',
      group: UserGroupEnum.TERRITORY,
    });
  });

  describe('territory dashboard', () => {
    beforeEach(() => {
      cy.server();
      stubCampaignList();
      stubOperatorList();
      stubTerritoryList();
      stubStatList();
      stubLogin(UserGroupEnum.TERRITORY);
      stubUserMe(UserGroupEnum.TERRITORY);
      stubUserPatch(UserGroupEnum.TERRITORY);
      stubCampaignCreate(CampaignStatusEnum.DRAFT);
      stubCampaignPatch();
      stubCampaignLaunch();
      stubTripList(trips);
      stubMainLists(UserGroupEnum.TERRITORY);
      stubTerritoryPatchContacts();
      stubTripExport();
      stubApiAdress('lyo');
      stubApiAdress('paris');
      stubApiAdress('marseil');
      stubApiAdress('massy');
      stubLogout();
    });

    // run tests
    testTerritoryStory(config.territory);

    // LOGOUT
    describe('Logout', () => {
      cypress_logout();
    });
  });
});
