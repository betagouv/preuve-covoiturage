export const financialIncentivePolicy = {
  parent_id: null,
  status: 'template',
  name: 'Encourager financièrement le covoiturage',
  slug: 'encourager_financierement_le_covoiturage',
  description: "Campagne d'incitation financière au covoiturage à destination des conducteurs et des passagers.",
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
  start_date: null,
  end_date: null,
  unit: 'euro',
};

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
  start_date: null,
  end_date: null,
  unit: 'euro',
};

export const pollutionLimitPolicy = {
  parent_id: null,
  status: 'template',
  name: 'Limiter la pollution',
  slug: 'limiter_la_pollution',
  description: "Campagne d'incitation financière activable en cas de pic de pollution pour encourager le covoiturage.",
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
  start_date: null,
  end_date: null,
  unit: 'euro',
};

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
  start_date: null,
  end_date: null,
  unit: 'euro',
};

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

export const freeTravelForPassengerPolicy = {
  parent_id: null,
  status: 'template',
  name: 'Gratuité du covoiturage pour les passagers',
  slug: 'gratuite_du_covoiturage_pour_les_passagers',
  description:
    "Campagne d'incitation ou la participation financière du passager est pris en charge par la collectivité.",
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
  start_date: null,
  end_date: null,
  unit: 'euro',
};
