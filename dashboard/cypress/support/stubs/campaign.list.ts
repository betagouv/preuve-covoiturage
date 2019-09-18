import * as moment from 'moment';

import { CampaignsGenerator } from '../generators/campaigns.generator';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';
import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { IncentiveUnitEnum } from '../../../src/app/core/enums/campaign/incentive-unit.enum';
import { Campaign } from '../../../src/app/core/entities/campaign/campaign';

export const campaignStubs: Campaign[] = [
  {
    _id: '5d7775bf37043b8463b2a208',
    parent_id: '5d6930724f56e6e1d0654542',
    status: CampaignStatusEnum.VALIDATED,
    name: 'Encourager le covoiturage',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
    filters: {
      weekday: [0, 1, 2, 3, 4, 5, 6],
      time: [{ start: '08:00', end: '19:00' }],
      distance_range: {
        min: 0,
        max: 100,
      },
      rank: [TripRankEnum.A, TripRankEnum.B, TripRankEnum.C],
      operator_ids: [],
    },
    start: moment()
      .subtract('1', 'months')
      .toDate(),
    end: moment()
      .add('2', 'months')
      .toDate(),
    unit: IncentiveUnitEnum.EUR,
    retribution_rules: [],
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
    },
    trips_number: Math.floor(Math.random() * 10000),
    amount_spent: Math.floor(Math.random() * 20000),
  },
  {
    _id: '5d777822ff790e51107c6c4f',
    parent_id: '5d69319a9763dc801ea78de7',
    status: CampaignStatusEnum.VALIDATED,
    name: 'Limiter le trafic en semaine',
    description: 'Fusce vehicula dolor arcu, sit amet blandit dolor mollis.',
    filters: {
      weekday: [0, 1, 2, 3, 4],
      time: [
        {
          start: '06:00',
          end: '09:00',
        },
        {
          start: '16:00',
          end: '19:00',
        },
      ],
      distance_range: {
        min: 0,
        max: 100,
      },
      rank: [TripRankEnum.A, TripRankEnum.B, TripRankEnum.C],
      operator_ids: [],
    },
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
    },
    start: moment()
      .subtract('1', 'months')
      .toDate(),
    end: moment()
      .add('2', 'months')
      .toDate(),
    unit: IncentiveUnitEnum.EUR,
    retribution_rules: [],
    trips_number: Math.floor(Math.random() * 10000),
    amount_spent: Math.floor(Math.random() * 20000),
  },
  {
    _id: '5d77782eecbdea02802a81eb',
    parent_id: null,
    status: CampaignStatusEnum.VALIDATED,
    name: 'Limiter la pollution',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
    filters: {
      weekday: [0, 1, 2, 3, 4],
      time: [
        {
          start: '06:00',
          end: '09:00',
        },
        {
          start: '16:00',
          end: '19:00',
        },
      ],
      distance_range: {
        min: 0,
        max: 100,
      },
      rank: [TripRankEnum.A, TripRankEnum.B, TripRankEnum.C],
      operator_ids: [],
    },
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
    },
    start: moment()
      .subtract('1', 'months')
      .toDate(),
    end: moment()
      .add('2', 'months')
      .toDate(),
    unit: IncentiveUnitEnum.EUR,
    retribution_rules: [],
    trips_number: Math.floor(Math.random() * 10000),
    amount_spent: Math.floor(Math.random() * 20000),
  },
];

export function stubCampaignList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=campaign:list',
    response: (data) => ({
      payload: {
        data: [
          {
            id: 1568215196898,
            jsonrpc: '2.0',
            result: [...campaignStubs, ...CampaignsGenerator.list],
          },
        ],
      },
    }),
  });
}
