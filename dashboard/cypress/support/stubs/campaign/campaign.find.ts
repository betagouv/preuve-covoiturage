import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

export function stubCampaignFind(): void {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=campaign:find',
    response: (data) =>
      [
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            meta: null,
            data: {
              _id: 10,
              created_at: '2020-03-02T14:24:25.043Z',
              updated_at: '2020-03-02T14:24:25.043Z',
              deleted_at: null,
              parent_id: 3,
              territory_id: 58,
              start_date: '2020-03-03T23:00:00.000Z',
              end_date: '2020-03-31T21:59:59.999Z',
              name: 'Encourager financièrement le covoiturage',
              description:
                "Campagne d'incitation financière au covoiturage à destination des conducteurs et des passagers.",
              unit: 'euro',
              status: 'draft',
              global_rules: [
                {
                  slug: 'rank_whitelist_filter',
                  parameters: ['A', 'B', 'C'],
                },
                {
                  slug: 'weekday_filter',
                  parameters: [2, 3, 4, 5, 6, 0],
                },
                {
                  slug: 'distance_range_filter',
                  parameters: {
                    min: 2000,
                    max: 150000,
                  },
                },
                {
                  slug: 'max_amount_restriction',
                  parameters: {
                    amount: 90,
                    period: 'campaign',
                  },
                },
                {
                  slug: 'max_trip_restriction',
                  parameters: {
                    amount: 10,
                    period: 'campaign',
                  },
                },
                {
                  slug: 'max_trip_per_target_restriction',
                  parameters: {
                    target: 'passenger',
                    amount: 100,
                    period: 'month',
                  },
                },
              ],
              rules: [
                [
                  {
                    slug: 'passenger_only_filter',
                  },
                  {
                    slug: 'fixed_amount_setter',
                    parameters: 100,
                  },
                  {
                    slug: 'per_km_modifier',
                  },
                ],
              ],
              ui_status: {
                for_driver: true,
                for_passenger: true,
                for_trip: false,
                staggered: false,
                insee_mode: false,
                insee_filter: {
                  whiteList: [],
                  blackList: [],
                },
              },
              slug: null,
            },
          },
        },
      ] as JsonRPCResponse[],
  }).as('campaignFind');
}
