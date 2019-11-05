import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import {
  DistanceRangeGlobalRetributionRule,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OperatorIdsRetributionRule,
  RankRetributionRule,
  TimeRetributionRule,
  WeekdayRetributionRule,
} from '~/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import {
  AmountRetributionRule,
  ForDriverRetributionRule,
  PerKmRetributionRule,
} from '~/core/interfaces/campaign/api-format/campaign-rules.interface';
import { UserGroupEnum } from '~/core/enums/user/user-group.enum';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';

import { operatorStubs } from '../stubs/operator/operator.list';
import { cypress_logging_users } from '../stubs/auth/login';
import { campaignTemplateStubs } from '../stubs/campaign/campaign-template.list';

export class CypressExpectedTemplates {
  static startMoment = Cypress.moment()
    .add(1, 'days')
    .startOf('day');
  static endMoment = Cypress.moment()
    .add(3, 'months')
    .startOf('day');

  static maxAmount = 10000;
  static maxTrips = 50000;

  static get(): Campaign[] {
    return campaignTemplateStubs.map((template) => {
      return new Campaign({
        ...template,
        start: <any>CypressExpectedTemplates.startMoment.toDate().toISOString(),
        end: <any>CypressExpectedTemplates.endMoment.toDate().toISOString(),
        global_rules: [
          ...template.global_rules,
          new MaxAmountRetributionRule(CypressExpectedTemplates.maxAmount),
          new MaxTripsRetributionRule(CypressExpectedTemplates.maxTrips),
          new OperatorIdsRetributionRule([operatorStubs[0]._id]),
        ],
        status: CampaignStatusEnum.DRAFT,
        parent_id: template._id,
        territory_id: cypress_logging_users[UserGroupEnum.TERRITORY].territory,
      });
    });
  }

  static getAfterCreate(index: number): Campaign {
    const afterCreationCampaign = CypressExpectedTemplates.get()[index];
    afterCreationCampaign._id = '5d8a3f7c6caa8c7f95a364f7';
    return afterCreationCampaign;
  }
}
