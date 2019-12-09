import { UserGroupEnum } from '~/core/enums/user/user-group.enum';

import { cypress_filter } from '../reusables/filter/cypress_filter';
import { cypress_profile } from '../reusables/profile/cypress_profile';
import { cypress_logging_users } from '../stubs/auth/login';
import { cypress_logout } from '../reusables/auth/cypress_logout';
import { cypress_users } from '../reusables/user/users.cypress';
import { cypress_campaign_list } from '../reusables/campaign/admin-campaign-list.cypress';

export function testRegistryStory(profile = true, filters = true, users = true, campaigns = true) {
  // PROFILE UPDATE
  if (profile) {
    describe('Profile update', () => {
      cypress_profile(cypress_logging_users.registry);
    });
  }

  // FILTERS
  if (filters) {
    describe('Filter trips', () => {
      cypress_filter(false, UserGroupEnum.REGISTRY);
    });
  }

  // // USERS
  // if (users) {
  //   describe('Manage users', () => {
  //     cypress_users();
  //   });
  // }

  // CAMPAIGNS
  if (campaigns) {
    describe('Follow campaigns', () => {
      cypress_campaign_list();
    });
  }

  // LOGOUT
  describe('Logout', () => {
    cypress_logout();
  });
}
