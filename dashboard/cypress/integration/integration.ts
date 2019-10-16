import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { Trip } from '~/core/entities/trip/trip';

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

context('OPERATOR', () => {
  const tripGenerator = new TripGenerator();
  const trips: Trip[] = [];
  for (let i = 0; i < 5; i = i + 1) {
    trips.push(tripGenerator.generateTrip());
  }

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
  });

  testOperatorStory();
});

context('REGISTRY', () => {
  const tripGenerator = new TripGenerator();
  const trips: Trip[] = [];
  for (let i = 0; i < 5; i = i + 1) {
    trips.push(tripGenerator.generateTrip());
  }

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
  });

  testRegistryStory();
});

context('TERRITORY', () => {
  const tripGenerator = new TripGenerator();
  const trips: Trip[] = [];
  for (let i = 0; i < 5; i = i + 1) {
    trips.push(tripGenerator.generateTrip());
  }
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
    stubLogout();
  });

  testTerritoryStory();
});
