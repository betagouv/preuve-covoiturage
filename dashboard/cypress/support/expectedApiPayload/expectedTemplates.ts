import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import {
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OperatorIdsGlobalRetributionRule,
} from '~/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

import { operatorStubs } from '../stubs/operator/operator.list';
import { cypress_logging_users } from '../stubs/auth/login';
import { campaignTemplateStubs } from '../stubs/campaign/campaign.list';

export class CypressExpectedTemplates {
  static startMoment = Cypress.moment()
    .add(1, 'days')
    .startOf('day');
  static endMoment = Cypress.moment()
    .add(3, 'months')
    .endOf('day');

  static maxAmount = 10000;
  static maxTrips = 50000;

  static get(): Campaign[] {
    return campaignTemplateStubs.map(
      (template) =>
        new Campaign({
          ...template,
          start_date: <any>CypressExpectedTemplates.startMoment.toISOString(),
          end_date: <any>CypressExpectedTemplates.endMoment.toISOString(),
          global_rules: [
            ...template.global_rules,
            new MaxAmountRetributionRule(CypressExpectedTemplates.maxAmount),
            new MaxTripsRetributionRule(CypressExpectedTemplates.maxTrips),
            new OperatorIdsGlobalRetributionRule([operatorStubs[0]._id]),
          ],
          status: CampaignStatusEnum.DRAFT,
          parent_id: template._id,
          territory_id: cypress_logging_users[UserGroupEnum.TERRITORY].territory_id,
        }),
    );
  }

  static getAfterCreate(index: number): Campaign {
    const afterCreationCampaign = CypressExpectedTemplates.get()[index];
    afterCreationCampaign._id = 541;
    return afterCreationCampaign;
  }
}
