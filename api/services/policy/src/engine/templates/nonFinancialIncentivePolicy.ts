export const nonFinancialIncentivePolicy = {
  parent_id: null,
  status: 'template',
  name: 'Récompenser le covoiturage',
  slug: 'recompenser_le_covoiturage',
  description:
    "Campagne d'incitation basée sur un système de gratification par points donnant accès" +
    ' à un catalogue de récompenses (place de parking, place de piscine, composteur, etc.)',
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
  start_date: null,
  end_date: null,
  unit: 'point',
};
