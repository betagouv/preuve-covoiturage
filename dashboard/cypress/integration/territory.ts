import { Trip } from '../../src/app/core/entities/trip/trip';
import { CampaignStatusEnum } from '../../src/app/core/enums/campaign/campaign-status.enum';
import { UserGroupEnum } from '../../src/app/core/enums/user/user-group.enum';

import { stubCampaignList } from '../support/stubs/campaign/campaign.list';
import { stubOperatorList } from '../support/stubs/operator/operator.list';
import { stubTripList } from '../support/stubs/trip/trip.list';
import { stubStatList } from '../support/stubs/stat/stat.list';
import { stubUserMe } from '../support/stubs/user/user.me';
import { stubCampaignCreate } from '../support/stubs/campaign/campaign.create';
import { stubCampaignPatch } from '../support/stubs/campaign/campaign.patch';
import { TripGenerator } from '../support/generators/trips.generator';
import { testTerritoryStory } from '../support/stories/territory.story';
import { stubTerritoryList } from '../support/stubs/territory/territory.list';
import { stubCampaignTemplateList } from '../support/stubs/campaign/campaign-template.list';
import { stubCampaignLaunch } from '../support/stubs/campaign/campaign.launched';
import { stubMainLists } from '../support/stubs/loadMainLists';
import { stubTerritoryPatchContacts } from '../support/stubs/territory/territory.patchContacts';
import { stubUserPatch } from '../support/stubs/user/user.patch';
import { stubLogin } from '../support/stubs/auth/login';
import { stubLogout } from '../support/stubs/auth/logout';

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
