import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_login } from '../reusables/auth/cypress_login';
import { cypress_filter } from '../reusables/filter/cypress_filter';
import { cypress_campaignCreate } from '../reusables/campaign/cypress_campaign_create';
import { cypress_campaignEdit } from '../reusables/campaign/cypress_campaign_edit';
import { cypress_campaignLaunch } from '../reusables/campaign/cypress_campaign_launch';
import { cypress_profile } from '../reusables/profile/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_territory } from '../reusables/territory/cypress_territory';
import { territoryStub } from '../stubs/territory/territory.find';
import { cypress_logout } from '../reusables/auth/cypress_logout';
import { cypress_campaignCreateFromTemplate } from '../reusables/campaign/cypress_campaign_create_from_template';
// tslint:disable-next-line:max-line-length
import { cypress_campaignEditCreatedFromTemplate } from '../reusables/campaign/cypress_campaign_edit_created_from_template';
import { TestsInterface } from '../../config/tests.interface';
import { campaignTemplateStubs } from '../stubs/campaign/campaign.list';

export function territoryE2EStory(config: TestsInterface['territory']) {
  cypress_login(
    {
      email: 'territory@example.com',
      password: 'admin1234',
      group: UserGroupEnum.TERRITORY,
    },
    true,
  );

  if (config.profile) {
    // PROFILE UPDATE
    describe('Profile update', () => {
      cypress_profile(cypress_logging_users.territories, true);
    });
  }

  if (config.territory) {
    // TERRITORY UPDATE
    describe('Territory update', () => {
      cypress_territory(territoryStub, true);
    });
  }

  if (config.newcampaign) {
    describe('Create new campaign', () => {
      cypress_campaignCreate(true);
    });
  }
  if (config.editcampaign) {
    describe('Edit campaign', () => {
      cypress_campaignEdit(true);
    });
  }

  if (config.launchcampaign) {
    describe('Launch campaign', () => {
      cypress_campaignLaunch(true);
    });
  }

  if (config.newFromTemplate) {
    const length = <number>campaignTemplateStubs.length;
    for (let i = 0; i < length; i += 1) {
      describe(`Create from template ${i + 1}`, () => {
        cypress_campaignCreateFromTemplate(i, true);
      });
    }

    describe('Edit latest campaign from template', () => {
      cypress_campaignEditCreatedFromTemplate();
    });
  }

  if (config.filters) {
    // FILTERS
    describe('Filter trips', () => {
      cypress_filter(true, UserGroupEnum.TERRITORY);
    });
  }

  // LOGOUT
  describe('Logout', () => {
    cypress_logout();
  });
}
