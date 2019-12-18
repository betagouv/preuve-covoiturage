import * as moment from 'moment';

import {
  AmountRetributionRule,
  ForPassengerRetributionRule,
} from '~/core/interfaces/campaign/api-format/campaign-rules.interface';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { CampaignInterface } from '~/core/entities/api/shared/common/interfaces/CampaignInterface';

import {
  DistanceRangeGlobalRetributionRule,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OperatorIdsGlobalRetributionRule,
  RankGlobalRetributionRule,
  TimeRetributionRule,
  WeekdayRetributionRule,
} from '../../../src/app/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';
import { operatorStubs } from '../stubs/operator/operator.list';
import { territoryStub } from '../stubs/territory/territory.find';

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

  static get list(): CampaignInterface[] {
    const campaignMocks = [...Array(20)].map(
      (val, idx) =>
        <CampaignInterface>{
          _id: 100,
          status: CampaignsGenerator.status[CampaignsGenerator.randomStatus()],
          name: `Name ${idx}`,
          description: `Description ${idx}`,
          start_date: moment()
            .subtract(Math.floor(Math.random() * 10), 'days')
            .subtract('1', 'months')
            .toDate(),
          end_date: moment()
            .add('2', 'months')
            .toDate(),
          global_rules: [
            new MaxAmountRetributionRule(Math.floor(Math.random() * 10000)),
            new MaxTripsRetributionRule(Math.floor(Math.random() * 20000)),
            new DistanceRangeGlobalRetributionRule({
              min: 0,
              max: 15,
            }),
            new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
            new RankGlobalRetributionRule([TripRankEnum.A, TripRankEnum.C]),
            new OperatorIdsGlobalRetributionRule([operatorStubs[0]._id]),
            new TimeRetributionRule([
              {
                start: 8,
                end: 9,
              },
            ]),
          ],
          rules: [[new ForPassengerRetributionRule(), new AmountRetributionRule(100)]],
          trips_number: Math.floor(Math.random() * 10000),
          amount_spent: Math.floor(Math.random() * 20000),
          unit: IncentiveUnitEnum.EUR,
          territory_id: territoryStub._id,
          ui_status: {
            for_driver: true,
            for_passenger: true,
            for_trip: false,
            staggered: false,
          },
        },
    );

    campaignMocks.push();

    return campaignMocks;
  }
}
