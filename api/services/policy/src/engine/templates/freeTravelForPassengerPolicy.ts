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
