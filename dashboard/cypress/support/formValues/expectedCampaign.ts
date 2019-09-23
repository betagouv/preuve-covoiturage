import { UserGroupEnum } from '../../../src/app/core/enums/user/user-group.enum';
import { RetributionRulesSlugEnum } from '../../../src/app/core/interfaces/campaign/campaignInterface';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';
import { IncentiveUnitEnum } from '../../../src/app/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { Campaign } from '../../../src/app/core/entities/campaign/campaign';

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

  static get(): Campaign {
    const campaign = new Campaign({
      _id: null,
      start: CypressExpectedCampaign.startMoment.toDate(),
      end: CypressExpectedCampaign.endMoment.toDate(),
      unit: IncentiveUnitEnum.EUR,
      description: '',
      name: "Nouvelle campagne d'incitation",
      retribution_rules: [
        {
          slug: RetributionRulesSlugEnum.MAX_AMOUNT,
          parameters: {
            amount: CypressExpectedCampaign.maxAmount,
            period: 'campaign',
          },
        },
        {
          slug: RetributionRulesSlugEnum.MAX_TRIPS,
          parameters: {
            amount: CypressExpectedCampaign.maxTrips,
            period: 'campaign',
          },
        },
        {
          slug: RetributionRulesSlugEnum.RETRIBUTION,
          parameters: {
            max: -1,
            min: -1,
            for_driver: {
              per_km: true,
              per_passenger: false,
              amount: CypressExpectedCampaign.forDriverAmount,
            },
            for_passenger: {
              free: false,
              per_km: false,
              amount: CypressExpectedCampaign.forPassengerAmount,
            },
          },
        },
      ],
      filters: {
        weekday: [0],
        time: [],
        distance_range: {
          min: 85,
          max: 150,
        },
        rank: [TripRankEnum.A, TripRankEnum.C],
        operators_id: [operatorStubs[0]._id],
      },
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
}
