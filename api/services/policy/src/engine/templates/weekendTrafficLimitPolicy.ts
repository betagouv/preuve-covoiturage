export const weekendTrafficLimitPolicy = {
  parent_id: null,
  status: 'template',
  name: 'Limiter les embouteillages du week-end',
  slug: 'limiter_les_embouteillages_du_weekend',
  description:
    "Campagne d'incitation financière pour limiter les embouteillages les week-end notamment en cas de chassé croisé.",
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
        slug: 'progressive_distance_range_meta',
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
        slug: 'progressive_distance_range_meta',
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
  start_date: null,
  end_date: null,
  unit: 'euro',
};
