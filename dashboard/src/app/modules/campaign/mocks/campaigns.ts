import * as moment from 'moment';

import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import {
  CampaignInterface,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
} from '~/core/interfaces/campaign/campaignInterface';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';

function randomStatus() {
  return Math.floor(Math.random() * Object.keys(CampaignStatusEnum).length);
}

export const campaignMocks = [...Array(20)].map(
  (val, idx) =>
    <CampaignInterface>{
      _id: '5d6fa2995623dc991b288f11',
      status: CampaignStatusEnum[Object.keys(CampaignStatusEnum)[randomStatus()]],
      name: `Name ${idx}`,
      description: `Description ${idx}`,
      start: moment().toDate(),
      end: moment()
        .add('3', 'months')
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
