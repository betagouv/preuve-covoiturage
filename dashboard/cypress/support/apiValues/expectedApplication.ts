import { ApplicationInterface } from '~/core/interfaces/operator/applicationInterface';
import { ApplicationName } from '~/core/entities/operator/applicationName';

import { CAMPAIGN_RULES_MAX_DISTANCE_KM } from '../../../src/app/core/const/campaign/rules.const';
import { Campaign } from '../../../src/app/core/entities/campaign/api-format/campaign';
import {
  DistanceRangeGlobalRetributionRule,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OperatorIdsRetributionRule,
  RankRetributionRule,
  TimeRetributionRule,
  WeekdayRetributionRule,
} from '../../../src/app/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import {
  AmountRetributionRule,
  ForDriverRetributionRule,
  ForPassengerRetributionRule,
  PerKmRetributionRule,
  RangeRetributionRule,
} from '../../../src/app/core/interfaces/campaign/api-format/campaign-rules.interface';
import { UserGroupEnum } from '../../../src/app/core/enums/user/user-group.enum';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';
import { IncentiveUnitEnum } from '../../../src/app/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { operatorStubs } from '../stubs/operator/operator.list';
import { cypress_logging_users } from '../stubs/auth/login';

export class CypressExpectedApplication {
  static get(): ApplicationName {
    return {
      name: 'new application',
    };
  }

  static getAfterCreate(): ApplicationInterface {
    const afterCreationApplication = <ApplicationInterface>CypressExpectedApplication.get();
    afterCreationApplication._id = '5d8a3f7c6caa8c7f95a364f7';
    afterCreationApplication.created_at = new Date();
    return afterCreationApplication;
  }
}
