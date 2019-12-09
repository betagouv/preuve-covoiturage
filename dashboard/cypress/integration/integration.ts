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
import { testOperatorStory } from '../support/stories/operator.story';
import { stubLogin } from '../support/stubs/auth/login';
import { stubOperatorPatchContacts } from '../support/stubs/operator/operator.patchContacts';
import { testRegistryStory } from '../support/stories/registry.story';
import { stubCampaignTemplateList } from '../support/stubs/campaign/campaign-template.list';
import { stubCampaignCreate } from '../support/stubs/campaign/campaign.create';
import { stubCampaignPatch } from '../support/stubs/campaign/campaign.patch';
import { stubCampaignLaunch } from '../support/stubs/campaign/campaign.launched';
import { stubTerritoryPatchContacts } from '../support/stubs/territory/territory.patchContacts';
import { testTerritoryStory } from '../support/stories/territory.story';
import { stubUserList } from '../support/stubs/user/user.list';
import { UserGenerator } from '../support/generators/user.generator';
import { stubApplications } from '../support/stubs/operator/application/application.list';
import { ApplicationsGenerator } from '../support/generators/applications.generator';
import { stubApplicationCreate } from '../support/stubs/operator/application/application.create';
import { stubApplicationRevoke } from '../support/stubs/operator/application/application.revoke';
import { cypress_login } from '../support/reusables/auth/cypress_login';
import { stubApiAdress } from '../support/stubs/external/api-adresse';
import { stubVisibilityList } from '../support/stubs/territory/territory.listOperator';
import { stubVisibilityUpdate } from '../support/stubs/territory/territory.updateOperator';
import { stubTripExport } from '../support/stubs/trip/trip.export';

/**
 * parameters to decide with contexts to run when in local
 */
const localTesting = {
  operator: false,
  territory: true,
  registry: false,
};

const isLocal = Cypress.env('ENV_NAME') && Cypress.env('ENV_NAME') === 'local';

function cypress_context_operator() {
  context('OPERATOR', () => {
    if (isLocal && !localTesting.operator) {
      return;
    }

    const trips = TripGenerator.generateTrips();
    const applications = ApplicationsGenerator.generateApplications();

    describe('login', () => {
      cypress_login({
        email: 'operator@example.com',
        password: 'admin1234',
        group: UserGroupEnum.OPERATOR,
      });
    });

    describe('operator dashboard', () => {
      beforeEach(() => {
        cy.server();
        stubCampaignList();
        stubOperatorList();
        stubTerritoryList();
        stubTripList(trips);
        stubStatList();
        stubOperatorPatchContacts();
        stubMainLists(UserGroupEnum.OPERATOR);

        stubLogin(UserGroupEnum.OPERATOR);
        stubUserMe(UserGroupEnum.OPERATOR);
        stubUserPatch(UserGroupEnum.OPERATOR);
        stubLogout();

        stubApplications(applications);
        stubApplicationCreate();
        stubApplicationRevoke();

        stubVisibilityList();
        stubVisibilityUpdate();
      });

      if (!isLocal) {
        // continuous integration testing
        testOperatorStory();
      } else {
        // local testing
        testOperatorStory(true, true, true, true);
      }
    });
  });
}

function cypress_context_registry() {
  context('REGISTRY', () => {
    if (isLocal && !localTesting.registry) {
      return;
    }
    const users = UserGenerator.generateList(UserGroupEnum.REGISTRY);
    const trips = TripGenerator.generateTrips();

    describe('login', () => {
      cypress_login({
        email: 'territory@example.com',
        password: 'admin1234',
        group: UserGroupEnum.REGISTRY,
      });
    });

    describe('registry dashboard', () => {
      beforeEach(() => {
        cy.server();
        stubCampaignList();
        stubOperatorList();
        stubTerritoryList();
        stubTripList(trips);
        stubStatList();
        stubMainLists(UserGroupEnum.REGISTRY);
        stubLogin(UserGroupEnum.REGISTRY);
        stubUserMe(UserGroupEnum.REGISTRY);
        stubUserPatch(UserGroupEnum.REGISTRY);
        stubLogout();
        stubUserList(users);
      });

      if (!isLocal) {
        // continuous integration testing
        testRegistryStory();
      } else {
        // local testing
        testRegistryStory(false, false, false, true);
      }
    });
  });
}

function cypress_context_territory() {
  context('TERRITORY', () => {
    if (isLocal && !localTesting.territory) {
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
        stubCampaignTemplateList();
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

      if (!isLocal) {
        // continuous integration testing
        testTerritoryStory();
      } else {
        // local testing
        testTerritoryStory(false, false, false, false, false, false, false, true);
      }
    });
  });
}

// run contexts
cypress_context_operator();
cypress_context_registry();
cypress_context_territory();
