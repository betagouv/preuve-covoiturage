import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

import { TemplateInterface } from '../../../src/app/core/interfaces/campaign/templateInterface';
import { CampaignStatusEnum } from '../../../src/app/core/enums/campaign/campaign-status.enum';
import { IncentiveUnitEnum } from '../../../src/app/core/enums/campaign/incentive-unit.enum';
import { TripRankEnum } from '../../../src/app/core/enums/trip/trip-rank.enum';

export const campaignTemplateStubs: TemplateInterface[] = [
  {
    _id: '5d6930724f56e6e1d0654543',
    parent_id: '5d6930724f56e6e1d0654542',
    status: CampaignStatusEnum.TEMPLATE,
    name: 'Encourager le covoiturage',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
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
        max: 100,
      },
      rank: [TripRankEnum.A, TripRankEnum.B],
      operators_id: [],
    },
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    start: null,
    end: null,
    unit: IncentiveUnitEnum.EUR,
    retribution_rules: [],
  },
  {
    _id: '5d69319a9763dc801ea78de6',
    parent_id: '5d69319a9763dc801ea78de7',
    status: CampaignStatusEnum.TEMPLATE,
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
      operators_id: [],
    },
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    start: null,
    end: null,
    unit: IncentiveUnitEnum.EUR,
    retribution_rules: [],
  },
  {
    _id: '5d69319a9763dc801ea78de4',
    parent_id: '5d69319a9763dc801ea78d18',
    status: CampaignStatusEnum.TEMPLATE,
    name: 'Limiter la pollution',
    description: 'Cras quis nulla commodo, aliquam lectus sed, blandit augue.',
    filters: {
      weekday: [0],
      time: [],
      distance_range: {
        min: 0,
        max: 100,
      },
      rank: [],
      operators_id: [],
    },
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    start: null,
    end: null,
    unit: IncentiveUnitEnum.EUR,
    retribution_rules: [],
  },
];

export function stubCampaignTemplateList() {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=campaign:list',
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
