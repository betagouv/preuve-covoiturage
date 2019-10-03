import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import {
  DistanceRangeGlobalRetributionRule,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OperatorIdsRetributionRule,
  RankRetributionRule,
  TimeRetributionRule,
  WeekdayRetributionRule,
} from '../../../src/app/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import { TemplateInterface } from '../../../src/app/core/interfaces/campaign/templateInterface';
import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { IncentiveUnitEnum } from '../../../src/app/core/enums/campaign/incentive-unit.enum';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';

import { operatorStubs } from './operator.list';

export const campaignTemplateStubs: TemplateInterface[] = [
  {
    _id: '5d6930724f56e6e1d0654543',
    parent_id: '5d6930724f56e6e1d0654542',
    status: CampaignStatusEnum.TEMPLATE,
    name: 'Encourager le covoiturage',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
    global_rules: [
      new MaxAmountRetributionRule(Math.floor(Math.random() * 10000)),
      new MaxTripsRetributionRule(Math.floor(Math.random() * 20000)),
      new DistanceRangeGlobalRetributionRule({
        min: 0,
        max: 15,
      }),
      new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
      new RankRetributionRule([TripRankEnum.A, TripRankEnum.C]),
      new OperatorIdsRetributionRule([operatorStubs[0]._id]),
      new TimeRetributionRule([
        {
          start: '08:00',
          end: '19:00',
        },
      ]),
    ],
    rules: [],
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    start: null,
    end: null,
    unit: IncentiveUnitEnum.EUR,
  },
  {
    _id: '5d69319a9763dc801ea78de6',
    parent_id: '5d69319a9763dc801ea78de7',
    status: CampaignStatusEnum.TEMPLATE,
    name: 'Limiter le trafic en semaine',
    description: 'Fusce vehicula dolor arcu, sit amet blandit dolor mollis.',
    global_rules: [
      new MaxAmountRetributionRule(Math.floor(Math.random() * 10000)),
      new MaxTripsRetributionRule(Math.floor(Math.random() * 20000)),
      new DistanceRangeGlobalRetributionRule({
        min: 0,
        max: 15,
      }),
      new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
      new RankRetributionRule([TripRankEnum.A, TripRankEnum.C]),
      new OperatorIdsRetributionRule([operatorStubs[0]._id]),
      new TimeRetributionRule([
        {
          start: '08:00',
          end: '19:00',
        },
      ]),
    ],
    rules: [],
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    start: null,
    end: null,
    unit: IncentiveUnitEnum.EUR,
  },
  {
    _id: '5d69319a9763dc801ea78de4',
    parent_id: '5d69319a9763dc801ea78d18',
    status: CampaignStatusEnum.TEMPLATE,
    name: 'Limiter la pollution',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
    global_rules: [
      new MaxAmountRetributionRule(Math.floor(Math.random() * 10000)),
      new MaxTripsRetributionRule(Math.floor(Math.random() * 20000)),
      new DistanceRangeGlobalRetributionRule({
        min: 0,
        max: 15,
      }),
      new WeekdayRetributionRule([0, 1, 2, 3, 4, 5, 6]),
      new RankRetributionRule([TripRankEnum.A, TripRankEnum.C]),
      new OperatorIdsRetributionRule([operatorStubs[0]._id]),
      new TimeRetributionRule([
        {
          start: '08:00',
          end: '19:00',
        },
      ]),
    ],
    rules: [],
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    start: null,
    end: null,
    unit: IncentiveUnitEnum.EUR,
  },
];

export function stubCampaignTemplateList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=campaign:listTemplate',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: campaignTemplateStubs,
          },
        },
      ],
  });
}
