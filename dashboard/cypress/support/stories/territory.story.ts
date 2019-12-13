import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_filter } from '../reusables/filter/cypress_filter';
import { cypress_campaignCreate } from '../reusables/campaign/cypress_campaign_create';
import { cypress_campaignEdit } from '../reusables/campaign/cypress_campaign_edit';
import { cypress_campaignLaunch } from '../reusables/campaign/cypress_campaign_launch';
import { cypress_territory } from '../reusables/territory/cypress_territory';
import { territoryStub } from '../stubs/territory/territory.find';
import { cypress_profile } from '../reusables/profile/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_logout } from '../reusables/auth/cypress_logout';
import { cypress_campaignCreateFromTemplate } from '../reusables/campaign/cypress_campaign_create_from_template';
import { campaignTemplateStubs } from '../stubs/campaign/campaign-template.list';
import { cypress_export } from '../reusables/trip/cypress_trip';
import { TestsInterface } from '../../config/tests.interface';

export function testTerritoryStory(config: TestsInterface['territory']) {
  // TEST PROFILE UPDATE
  if (config.profile) {
    describe('Profile update', () => {
      cypress_profile(cypress_logging_users.territories);
    });
  }

  // TEST TERRITORY UPDATE
  if (config.territory) {
    describe('Territory update', () => {
      cypress_territory(territoryStub);
    });
  }

  // TEST FILTERS
  if (config.filters) {
    describe('Filter trips', () => {
      cypress_filter(false, UserGroupEnum.TERRITORY);
    });
  }

  // TEST EXPORT
  if (config.exportTrips) {
    describe('Export trips', () => {
      cypress_export(false);
    });
  }

  // TEST CAMPAIGNS
  if (config.newcampaign) {
    describe('Create new campaign', () => {
      cypress_campaignCreate();
    });
  }

  if (config.editcampaign) {
    describe('Edit latest campaign', () => {
      cypress_campaignEdit();
    });
  }

  if (config.launchcampaign) {
    describe('Launch campaign', () => {
      cypress_campaignLaunch();
    });
  }

  if (config.newFromTemplate) {
    const length = <number>campaignTemplateStubs.length;
    // for (let i = 0; i < length; i += 1) {
    //   describe(`Create from template ${i + 1}`, () => {
    cypress_campaignCreateFromTemplate(6);
    // });
    // }

    // describe('Edit latest campaign from template', () => {
    //   cypress_campaignEditCreatedFromTemplate(0);
    // });
  }

  // LOGOUT
  describe('Logout', () => {
    cypress_logout();
  });
}
