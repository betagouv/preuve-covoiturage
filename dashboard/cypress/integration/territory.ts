import { Trip } from '../../src/app/core/entities/trip/trip';
import { CampaignStatusEnum } from '../../src/app/core/enums/campaign/campaign-status.enum';
import { UserGroupEnum } from '../../src/app/core/enums/user/user-group.enum';

import { stubCampaignList } from '../support/stubs/campaign.list';
import { stubOperatorList } from '../support/stubs/operator.list';
import { stubTripList } from '../support/stubs/trip.list';
import { stubStatList } from '../support/stubs/stat.list';
import { stubUserMe } from '../support/stubs/user.me';
import { stubCampaignCreate } from '../support/stubs/campaign.create';
import { stubCampaignPatch } from '../support/stubs/campaign.patch';
import { TripGenerator } from '../support/generators/trips.generator';
import { testTerritoryStory } from '../support/stories/territory.story';
import { cypress_stub_login } from '../support/reusables/cypress_login';
import { stubTerritoryList } from '../support/stubs/territory.list';
import { stubCampaignTemplateList } from '../support/stubs/campaign-template.list';
import { stubCampaignLaunch } from '../support/stubs/campaign.launched';
import { stubMainLists } from '../support/stubs/loadMainLists';

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
    cypress_stub_login(UserGroupEnum.TERRITORY);
    stubUserMe(UserGroupEnum.TERRITORY);
    stubCampaignCreate(CampaignStatusEnum.DRAFT);
    stubCampaignPatch();
    stubCampaignLaunch();
    stubTripList(trips);
    stubMainLists();
  });

  testTerritoryStory();
});
