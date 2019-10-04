import { Campaign } from '../../../src/app/core/entities/campaign/api-format/campaign';
import {
  DistanceRangeGlobalRetributionRule,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OperatorIdsRetributionRule,
  RankRetributionRule,
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

import { operatorStubs } from '../stubs/operator.list';
import { cypress_logging_users } from '../stubs/login';

export class CypressExpectedCampaign {
  static startMoment = Cypress.moment()
    .add(1, 'days')
    .startOf('day');
  static endMoment = Cypress.moment()
    .add(3, 'months')
    .startOf('day');

  static maxAmount = 10000;
  static maxTrips = 50000;
  static forDriverAmount = 10; // cents
  static forPassengerAmount = 0; // cents
  static description = 'Description de la campagne';
  static campaignName = "Nouvelle campagne d'incitation";

  static afterEditionForPassengerAmount = 10; // cents

  static get(): Campaign {
    const campaign = new Campaign({
      _id: null,
      start: CypressExpectedCampaign.startMoment.toDate(),
      end: CypressExpectedCampaign.endMoment.toDate(),
      unit: IncentiveUnitEnum.EUR,
      description: CypressExpectedCampaign.description,
      name: CypressExpectedCampaign.campaignName,
      global_rules: [
        new RankRetributionRule([TripRankEnum.A, TripRankEnum.C]),
        new WeekdayRetributionRule([0]),
        new OperatorIdsRetributionRule([operatorStubs[0]._id]),
        new DistanceRangeGlobalRetributionRule({
          min: 85,
          max: 150,
        }),
        new MaxAmountRetributionRule(CypressExpectedCampaign.maxAmount),
        new MaxTripsRetributionRule(CypressExpectedCampaign.maxTrips),
      ],
      rules: [
        [
          new ForDriverRetributionRule(),
          new AmountRetributionRule(CypressExpectedCampaign.forDriverAmount),
          new PerKmRetributionRule(),
        ],
      ],
      ui_status: {
        for_driver: true,
        for_passenger: false,
        for_trip: false,
        staggered: false,
      },
      status: CampaignStatusEnum.DRAFT,
      parent_id: null,
      territory_id: cypress_logging_users[UserGroupEnum.TERRITORY].territory,
    });

    campaign.start = <any>campaign.start.toISOString();
    campaign.end = <any>campaign.end.toISOString();

    return campaign;
  }

  static getAfterCreate(): Campaign {
    const afterCreationCampaign = CypressExpectedCampaign.get();
    afterCreationCampaign._id = '5d8a3f7c6caa8c7f95a364f7';
    return afterCreationCampaign;
  }

  static getAfterEdition(): Campaign {
    const afterEditionCampaign = CypressExpectedCampaign.getAfterCreate();
    // afterEditionCampaign.rules[0].push(
    //   new RangeRetributionRule({
    //     min: 0,
    //     max: 5000,
    //   }),
    // );
    // afterEditionCampaign.rules.unshift([
    //   new ForPassengerRetributionRule(),
    //   new AmountRetributionRule(CypressExpectedCampaign.afterEditionForPassengerAmount),
    //   new RangeRetributionRule({
    //     min: 5000,
    //     max: 10000,
    //   }),
    // ]);
    afterEditionCampaign.ui_status.for_passenger = true;
    return afterEditionCampaign;
  }

  static getLaunched(): Campaign {
    const launchedCampaign = CypressExpectedCampaign.getAfterEdition();
    launchedCampaign.status = CampaignStatusEnum.PENDING;
    return launchedCampaign;
  }
}
