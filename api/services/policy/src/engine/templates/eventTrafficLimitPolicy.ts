export const eventTrafficLimitPolicy = {
  parent_id: null,
  status: 'template',
  name: "Limiter le trafic lors d'un évènement ponctuel",
  slug: 'limiter_le_trafic_lors_d_un_evenement_ponctuel',
  description: "Campagne d'incitation financière au covoiturage pour un événement ponctuel.",
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
  start_date: null,
  end_date: null,
  unit: 'euro',
};
