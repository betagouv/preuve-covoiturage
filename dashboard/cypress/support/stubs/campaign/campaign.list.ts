import * as moment from 'moment';

import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';
import { TripRankEnum } from '~/core/enums/trip/trip-rank.enum';
import { CampaignStatusEnum } from '~/core/enums/campaign/campaign-status.enum';
import { IncentiveUnitEnum } from '~/core/enums/campaign/incentive-unit.enum';
import { Campaign } from '~/core/entities/campaign/api-format/campaign';
import {
  DistanceRangeGlobalRetributionRule,
  MaxAmountRetributionRule,
  MaxTripsRetributionRule,
  OperatorIdsGlobalRetributionRule,
  RankGlobalRetributionRule,
  TimeRetributionRule,
  WeekdayRetributionRule,
} from '~/core/interfaces/campaign/api-format/campaign-global-rules.interface';
import {
  AmountRetributionRule,
  ForPassengerRetributionRule,
} from '~/core/interfaces/campaign/api-format/campaign-rules.interface';

import { CampaignsGenerator } from '../../generators/campaigns.generator';
import { operatorStubs } from '../operator/operator.list';
import { territoryStub } from '../territory/territory.find';
import { CypressExpectedCampaign } from '../../expectedApiPayload/expectedCampaign';

export const campaignStubs: Campaign[] = [
  {
    _id: '5d7775bf37043b8463b2a208',
    parent_id: '5d6930724f56e6e1d0654542',
    status: CampaignStatusEnum.VALIDATED,
    name: 'Encourager le covoiturage',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
    start_date: moment()
      .subtract('1', 'months')
      .toDate(),
    end_date: moment()
      .add('2', 'months')
      .toDate(),
    unit: IncentiveUnitEnum.EUR,
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    global_rules: [
      new MaxAmountRetributionRule(10000),
      new MaxTripsRetributionRule(Math.floor(Math.random() * 20000)),
      new DistanceRangeGlobalRetributionRule({
        min: 0,
        max: 15000,
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
    amount_spent: 5000,
    territory_id: territoryStub._id,
  },
  {
    _id: '5d777822ff790e51107c6c4f',
    parent_id: '5d69319a9763dc801ea78de7',
    status: CampaignStatusEnum.VALIDATED,
    name: 'Limiter le trafic en semaine',
    description: 'Fusce vehicula dolor arcu, sit amet blandit dolor mollis.',
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    global_rules: [
      new MaxAmountRetributionRule(10000),
      new MaxTripsRetributionRule(Math.floor(Math.random() * 20000)),
      new DistanceRangeGlobalRetributionRule({
        min: 0,
        max: 15000,
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
    start_date: moment()
      .subtract('1', 'months')
      .toDate(),
    end_date: moment()
      .add('2', 'months')
      .toDate(),
    unit: IncentiveUnitEnum.EUR,
    trips_number: Math.floor(Math.random() * 10000),
    amount_spent: 5000,
    territory_id: territoryStub._id,
  },
  {
    _id: '5d77782eecbdea02802a81eb',
    parent_id: null,
    status: CampaignStatusEnum.VALIDATED,
    name: 'Limiter la pollution',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    start_date: moment()
      .subtract('1', 'months')
      .toDate(),
    end_date: moment()
      .add('2', 'months')
      .toDate(),
    unit: IncentiveUnitEnum.EUR,
    global_rules: [
      new MaxAmountRetributionRule(10000),
      new MaxTripsRetributionRule(Math.floor(Math.random() * 20000)),
      new DistanceRangeGlobalRetributionRule({
        min: 0,
        max: 15000,
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
    amount_spent: 5000,
    territory_id: territoryStub._id,
  },
  CypressExpectedCampaign.getAfterCreate(),
];

export function stubCampaignList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=campaign:list',
    response: (data) =>
      <JsonRPCResponse[]>[
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: [...campaignStubs, ...CampaignsGenerator.list],
          },
        },
      ],
  });
}
