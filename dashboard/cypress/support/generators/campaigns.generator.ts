import * as moment from 'moment';

import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import {
  CampaignInterface,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
} from '../../../src/app/core/interfaces/campaign/campaignInterface';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';
import { Campaign } from '../../../src/app/core/entities/campaign/campaign';

export class CampaignsGenerator {
  private static get status(): CampaignStatusEnum[] {
    return [
      CampaignStatusEnum.PENDING,
      CampaignStatusEnum.VALIDATED,
      CampaignStatusEnum.ARCHIVED,
      CampaignStatusEnum.DRAFT,
    ];
  }

  private static randomStatus() {
    return Math.floor(Math.random() * CampaignsGenerator.status.length);
  }

  static get list(): Campaign[] {
    const campaignMocks = [...Array(20)].map(
      (val, idx) =>
        <CampaignInterface>{
          _id: '5d6fa2995623dc991b288f11',
          status: CampaignStatusEnum[CampaignsGenerator.status[CampaignsGenerator.randomStatus()]],
          name: `Name ${idx}`,
          description: `Description ${idx}`,
          start: moment()
            .subtract(Math.floor(Math.random() * 10), 'days')
            .subtract('1', 'months')
            .toDate(),
          end: moment()
            .add('2', 'months')
            .toDate(),
          filters: {
            weekday: [0, 1, 2, 3, 4, 5, 6],
            time: [
              {
                start: '08:00',
                end: '19:00',
              },
            ],
            distance_range: {
              min: 0,
              max: 15,
            },
            rank: [TripRankEnum.A, TripRankEnum.B],
          },
          retribution_rules: [
            new MaxAmountRetributionRule(Math.floor(Math.random() * 10000)),
            new MaxTripsRetributionRule(Math.floor(Math.random() * 20000)),
          ],
          trips_number: Math.floor(Math.random() * 10000),
          amount_spent: Math.floor(Math.random() * 20000),
        },
    );

    campaignMocks.push();

    return campaignMocks;
  }
}
