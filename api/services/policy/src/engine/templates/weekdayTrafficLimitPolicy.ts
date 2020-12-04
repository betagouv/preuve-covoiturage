export const weekdayTrafficLimitPolicy = {
  parent_id: null,
  status: 'template',
  name: 'Limiter le trafic en semaine',
  slug: 'limiter_le_trafic_en_semaine',
  description: "Campagne d'incitation pour limiter le trafic en semaine.",
  global_rules: [
    {
      slug: 'weekday_filter',
      parameters: [1, 2, 3, 4, 5], // WARN: 0 = dimanche
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
          tz: 'Europe/Paris',
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
      slug: 'max_trip_restriction',
      parameters: {
        uuid: 'driver_max_trip_restriction',
        target: 'driver',
        amount: 8,
        period: 'day',
      },
    },
    {
      slug: 'max_trip_restriction',
      parameters: {
        uuid: 'passenger_max_trip_restriction',
        target: 'passenger',
        amount: 2,
        period: 'day',
      },
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
    for_passenger: true,
    for_trip: false,
    staggered: true,
  },
  start_date: null,
  end_date: null,
  unit: 'euro',
};
