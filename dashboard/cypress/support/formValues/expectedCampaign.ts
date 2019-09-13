import { RetributionRulesSlugEnum } from '../../../src/app/core/interfaces/campaign/campaignInterface';

import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';
import { IncentiveUnitEnum } from '../../../src/app/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { Campaign } from '../../../src/app/core/entities/campaign/campaign';
import { operatorStubs } from '../stubs/operator.list';

export class CypressExpectedCampaign {
  static startMoment = Cypress.moment()
    .add(1, 'days')
    .startOf('day');
  static endMoment = Cypress.moment()
    .add(3, 'months')
    .startOf('day');

  static maxAmount = 10000;
  static maxTrips = 50000;
  static forDriverAmount = 0.1;
  static forPassengerAmount = 0.2;

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
          parameters: { max_amount: CypressExpectedCampaign.maxAmount },
          description: '',
        },
        {
          slug: RetributionRulesSlugEnum.MAX_TRIPS,
          parameters: { max_trips: CypressExpectedCampaign.maxTrips },
          description: '',
        },
        {
          slug: RetributionRulesSlugEnum.RETRIBUTION,
          description: '',
          parameters: {
            max: null,
            min: null,
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
        operator_ids: [operatorStubs[0]._id],
      },
      ui_status: {
        for_driver: true,
        for_passenger: true,
        for_trip: null,
      },
      status: CampaignStatusEnum.DRAFT,
      parent_id: null,
    });

    campaign.start = <any>campaign.start.toISOString();
    campaign.end = <any>campaign.end.toISOString();

    return campaign;
  }
}
