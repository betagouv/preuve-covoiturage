import { JsonRPCResponse } from '~/core/entities/api/jsonRPCResponse';

export function stubCampaignTemplates(): void {
  cy.route({
    method: 'POST',
    url: '/rpc?methods=campaign:templates',
    response: (data) =>
      [
        {
          id: 1568215196898,
          jsonrpc: '2.0',
          result: {
            data: [
              {
                _id: 26,
                created_at: '2020-03-03T16:06:50.521Z',
                updated_at: '2020-03-03T16:06:50.521Z',
                deleted_at: null,
                parent_id: null,
                territory_id: null,
                start_date: null,
                end_date: null,
                name: 'Encourager financièrement le covoiturage',
                description:
                  "Campagne d'incitation financière au covoiturage à destination des conducteurs et des passagers.",
                unit: 'euro',
                status: 'template',
                global_rules: [
                  {
                    slug: 'rank_whitelist_filter',
                    parameters: ['A', 'B', 'C'],
                  },
                  {
                    slug: 'distance_range_filter',
                    parameters: {
                      min: 2000,
                      max: 150000,
                    },
                  },
                  {
                    slug: 'weekday_filter',
                    parameters: [0, 1, 2, 3, 4, 5, 6],
                  },
                ],
                rules: [
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 0,
                        max: 50000,
                      },
                    },
                    {
                      slug: 'passenger_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 10,
                    },
                    {
                      slug: 'per_km_modifier',
                      parameters: true,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 0,
                        max: 50000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 10,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                    {
                      slug: 'per_km_modifier',
                      parameters: true,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 50000,
                        max: 150000,
                      },
                    },
                    {
                      slug: 'passenger_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 500,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 50000,
                        max: 150000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 500,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                  ],
                ],
                ui_status: {
                  for_driver: true,
                  for_passenger: true,
                  for_trip: false,
                  staggered: true,
                },
                slug: 'encourager_financierement_le_covoiturage',
              },
              {
                _id: 32,
                created_at: '2020-03-03T16:06:50.552Z',
                updated_at: '2020-03-03T16:06:50.552Z',
                deleted_at: null,
                parent_id: null,
                territory_id: null,
                start_date: null,
                end_date: null,
                name: 'Gratuité du covoiturage pour les passagers',
                description:
                  // eslint-disable-next-line
                  "Campagne d'incitation ou la participation financière du passager est pris en charge par la collectivité.",
                unit: 'euro',
                status: 'template',
                global_rules: [
                  {
                    slug: 'rank_whitelist_filter',
                    parameters: ['A', 'B', 'C'],
                  },
                  {
                    slug: 'weekday_filter',
                    parameters: [0, 1, 2, 3, 4, 5, 6],
                  },
                  {
                    slug: 'distance_range_filter',
                    parameters: {
                      min: 2000,
                      max: 150000,
                    },
                  },
                ],
                rules: [
                  [
                    {
                      slug: 'passenger_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'cost_based_amount_setter',
                      parameters: true,
                    },
                  ],
                ],
                ui_status: {
                  for_driver: false,
                  for_passenger: true,
                  for_trip: false,
                  staggered: false,
                },
                slug: 'gratuite_du_covoiturage_pour_les_passagers',
              },
              {
                _id: 29,
                created_at: '2020-03-03T16:06:50.536Z',
                updated_at: '2020-03-03T16:06:50.536Z',
                deleted_at: null,
                parent_id: null,
                territory_id: null,
                start_date: null,
                end_date: null,
                name: 'Limiter la pollution',
                description:
                  // eslint-disable-next-line
                  "Campagne d'incitation financière activable en cas de pic de pollution pour encourager le covoiturage.",
                unit: 'euro',
                status: 'template',
                global_rules: [
                  {
                    slug: 'weekday_filter',
                    parameters: [0, 1, 2, 3, 4, 5, 6],
                  },
                  {
                    slug: 'rank_whitelist_filter',
                    parameters: ['A', 'B', 'C'],
                  },
                  {
                    slug: 'distance_range_filter',
                    parameters: {
                      min: 2000,
                      max: 150000,
                    },
                  },
                  {
                    slug: 'max_trip_per_target_restriction',
                    parameters: {
                      target: 'driver',
                      amount: 8,
                      period: 'day',
                    },
                  },
                  {
                    slug: 'max_trip_per_target_restriction',
                    parameters: {
                      target: 'passenger',
                      amount: 2,
                      period: 'day',
                    },
                  },
                ],
                rules: [
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 0,
                        max: 50000,
                      },
                    },
                    {
                      slug: 'passenger_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'cost_based_amount_setter',
                      parameters: true,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 0,
                        max: 50000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 10,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                    {
                      slug: 'per_km_modifier',
                      parameters: true,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 50000,
                        max: 150000,
                      },
                    },
                    {
                      slug: 'passenger_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 500,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 50000,
                        max: 150000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 500,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                  ],
                ],
                ui_status: {
                  for_driver: true,
                  for_passenger: true,
                  for_trip: false,
                  staggered: true,
                },
                slug: 'limiter_la_pollution',
              },
              {
                _id: 30,
                created_at: '2020-03-03T16:06:50.543Z',
                updated_at: '2020-03-03T16:06:50.543Z',
                deleted_at: null,
                parent_id: null,
                territory_id: null,
                start_date: null,
                end_date: null,
                name: 'Limiter les embouteillages du week-end',
                description:
                  // eslint-disable-next-line
                  "Campagne d'incitation financière pour limiter les embouteillages les week-end notamment en cas de chassé croisé.",
                unit: 'euro',
                status: 'template',
                global_rules: [
                  {
                    slug: 'weekday_filter',
                    parameters: [6, 0],
                  },
                  {
                    slug: 'rank_whitelist_filter',
                    parameters: ['A', 'B', 'C'],
                  },
                  {
                    slug: 'distance_range_filter',
                    parameters: {
                      min: 2000,
                      max: 150000,
                    },
                  },
                  {
                    slug: 'time_range_filter',
                    parameters: [
                      {
                        start: 12,
                        end: 23,
                      },
                    ],
                  },
                ],
                rules: [
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 0,
                        max: 50000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 10,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                    {
                      slug: 'per_km_modifier',
                      parameters: true,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 50000,
                        max: 150000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 500,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                  ],
                ],
                ui_status: {
                  for_driver: true,
                  for_passenger: false,
                  for_trip: false,
                  staggered: true,
                },
                slug: 'limiter_les_embouteillages_du_weekend',
              },
              {
                _id: 28,
                created_at: '2020-03-03T16:06:50.532Z',
                updated_at: '2020-03-03T16:06:50.532Z',
                deleted_at: null,
                parent_id: null,
                territory_id: null,
                start_date: null,
                end_date: null,
                name: 'Limiter le trafic en semaine',
                description: "Campagne d'incitation pour limiter le trafic en semaine.",
                unit: 'euro',
                status: 'template',
                global_rules: [
                  {
                    slug: 'weekday_filter',
                    parameters: [1, 2, 3, 4, 5],
                  },
                  {
                    slug: 'rank_whitelist_filter',
                    parameters: ['A', 'B', 'C'],
                  },
                  {
                    slug: 'time_range_filter',
                    parameters: [
                      {
                        start: 6,
                        end: 20,
                      },
                    ],
                  },
                  {
                    slug: 'distance_range_filter',
                    parameters: {
                      min: 2000,
                      max: 150000,
                    },
                  },
                  {
                    slug: 'max_trip_per_target_restriction',
                    parameters: {
                      target: 'driver',
                      amount: 8,
                      period: 'day',
                    },
                  },
                  {
                    slug: 'max_trip_per_target_restriction',
                    parameters: {
                      target: 'passenger',
                      amount: 2,
                      period: 'day',
                    },
                  },
                ],
                rules: [
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 0,
                        max: 50000,
                      },
                    },
                    {
                      slug: 'passenger_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 10,
                    },
                    {
                      slug: 'per_km_modifier',
                      parameters: true,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 0,
                        max: 50000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 10,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                    {
                      slug: 'per_km_modifier',
                      parameters: true,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 50000,
                        max: 150000,
                      },
                    },
                    {
                      slug: 'passenger_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 500,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 50000,
                        max: 150000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 500,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                  ],
                ],
                ui_status: {
                  for_driver: true,
                  for_passenger: true,
                  for_trip: false,
                  staggered: true,
                },
                slug: 'limiter_le_trafic_en_semaine',
              },
              {
                _id: 31,
                created_at: '2020-03-03T16:06:50.549Z',
                updated_at: '2020-03-03T16:06:50.549Z',
                deleted_at: null,
                parent_id: null,
                territory_id: null,
                start_date: null,
                end_date: null,
                name: "Limiter le trafic lors d'un évènement ponctuel",
                description: "Campagne d'incitation financière au covoiturage pour un événement ponctuel.",
                unit: 'euro',
                status: 'template',
                global_rules: [
                  {
                    slug: 'weekday_filter',
                    parameters: [0, 1, 2, 3, 4, 5, 6],
                  },
                  {
                    slug: 'rank_whitelist_filter',
                    parameters: ['A', 'B', 'C'],
                  },
                  {
                    slug: 'distance_range_filter',
                    parameters: {
                      min: 2000,
                      max: 150000,
                    },
                  },
                ],
                rules: [
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 0,
                        max: 50000,
                      },
                    },
                    {
                      slug: 'passenger_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 10,
                    },
                    {
                      slug: 'per_km_modifier',
                      parameters: true,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 0,
                        max: 50000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 10,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                    {
                      slug: 'per_km_modifier',
                      parameters: true,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 50000,
                        max: 150000,
                      },
                    },
                    {
                      slug: 'passenger_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 500,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 50000,
                        max: 150000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 500,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                  ],
                ],
                ui_status: {
                  for_driver: true,
                  for_passenger: true,
                  for_trip: false,
                  staggered: true,
                },
                slug: 'limiter_le_trafic_lors_d_un_evenement_ponctuel',
              },
              {
                _id: 27,
                created_at: '2020-03-03T16:06:50.527Z',
                updated_at: '2020-03-03T16:06:50.527Z',
                deleted_at: null,
                parent_id: null,
                territory_id: null,
                start_date: null,
                end_date: null,
                name: 'Récompenser le covoiturage',
                description:
                  // eslint-disable-next-line
                  "Campagne d'incitation basée sur un système de gratification par points donnant accès à un catalogue de récompenses (place de parking, place de piscine, composteur, etc.)",
                unit: 'point',
                status: 'template',
                global_rules: [
                  {
                    slug: 'rank_whitelist_filter',
                    parameters: ['A', 'B', 'C'],
                  },
                  {
                    slug: 'weekday_filter',
                    parameters: [0, 1, 2, 3, 4, 5, 6],
                  },
                  {
                    slug: 'distance_range_filter',
                    parameters: {
                      min: 2000,
                      max: 150000,
                    },
                  },
                ],
                rules: [
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 0,
                        max: 50000,
                      },
                    },
                    {
                      slug: 'passenger_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 1,
                    },
                    {
                      slug: 'per_km_modifier',
                      parameters: true,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 0,
                        max: 50000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 1,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                    {
                      slug: 'per_km_modifier',
                      parameters: true,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 50000,
                        max: 150000,
                      },
                    },
                    {
                      slug: 'passenger_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 50,
                    },
                  ],
                  [
                    {
                      slug: 'distance_range_filter',
                      parameters: {
                        min: 50000,
                        max: 150000,
                      },
                    },
                    {
                      slug: 'driver_only_filter',
                      parameters: true,
                    },
                    {
                      slug: 'fixed_amount_setter',
                      parameters: 50,
                    },
                    {
                      slug: 'per_passenger_modifier',
                      parameters: true,
                    },
                  ],
                ],
                ui_status: {
                  for_driver: true,
                  for_passenger: true,
                  for_trip: false,
                  staggered: true,
                },
                slug: 'recompenser_le_covoiturage',
              },
            ],
          },
        },
      ] as JsonRPCResponse[],
  });
}
