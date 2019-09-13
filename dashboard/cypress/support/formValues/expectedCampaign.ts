import { RetributionRulesSlugEnum } from '../../../src/app/core/interfaces/campaign/campaignInterface';

import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';
import { IncentiveUnitEnum } from '../../../src/app/core/enums/campaign/incentive-unit.enum';
import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { Campaign } from '../../../src/app/core/entities/campaign/campaign';
import { operatorStubs } from '../stubs/operator.list';

export class CypressExpectedCampaign {
  startMoment = Cypress.moment()
    .add(1, 'days')
    .startOf('day');
  endMoment = Cypress.moment()
    .add(3, 'months')
    .startOf('day');

  maxAmount = 10000;
  maxTrips = 50000;
  forDriverAmount = 0.1;
  forPassengerAmount = 0.2;

  get(): Campaign {
    const campaign = new Campaign({
      _id: null,
      start: this.startMoment.toDate(),
      end: this.endMoment.toDate(),
      unit: IncentiveUnitEnum.EUR,
      description: '',
      name: "Nouvelle campagne d'incitation",
      retribution_rules: [
        {
          slug: RetributionRulesSlugEnum.MAX_AMOUNT,
          parameters: { max_amount: this.maxAmount },
          description: '',
        },
        {
          slug: RetributionRulesSlugEnum.MAX_TRIPS,
          parameters: { max_trips: this.maxTrips },
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
              amount: this.forDriverAmount,
            },
            for_passenger: {
              free: false,
              per_km: false,
              amount: this.forPassengerAmount,
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
      status: CampaignStatusEnum.PENDING,
      parent_id: null,
    });

    campaign.start = <any>campaign.start.toISOString();
    campaign.end = <any>campaign.end.toISOString();

    return campaign;
  }
}
