import { expect } from 'chai';

import { faker } from '../../src/engine/helpers/faker';
import { TripInterface, CampaignInterface } from '../../src/interfaces';
import { PolicyEngine } from '../../src/engine/PolicyEngine';
import { helper } from './helper';

describe('Template: one', () => {
  const template: CampaignInterface = {
    parent_id: null,
    territory_id: 1, // drop
    status: 'active', // template
    name: 'Encourager financièrement le covoiturage',
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
          slug: 'fixed_amount',
          parameters: 10,
        },
        {
          slug: 'per_km',
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
          slug: 'fixed_amount',
          parameters: 10,
        },
        {
          slug: 'per_passenger',
          parameters: true,
        },
        {
          slug: 'per_km',
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
          slug: 'fixed_amount',
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
          slug: 'fixed_amount',
          parameters: 500,
        },
        {
          slug: 'per_passenger',
          parameters: true,
        },
      ],
    ],
    ui_status: {
      for_driver: true,
      for_passenger: true,
      for_trip: false,
      staggered: false,
    },
    start_date: new Date('2019-01-01'), // null
    end_date: new Date('2019-02-01'), // null
    unit: 'euro',
  };

  const trips: TripInterface[] = [
    faker.trip([
      {
        is_driver: true,
        identity_uuid: '0',
        distance: 1000,
        acquisition_id: 1,
      },
      {
        is_driver: false,
        identity_uuid: '1',
        distance: 1000,
        acquisition_id: 1,
      },
    ]),
    faker.trip(
      [
        {
          is_driver: true,
          identity_uuid: '2',
          distance: 5000,
          start_insee: '89318',
          end_insee: '89318',
          acquisition_id: 2,
        },
        {
          is_driver: false,
          identity_uuid: '3',
          distance: 5000,
          start_insee: '89318',
          end_insee: '89318',
          acquisition_id: 2,
        },
      ],
      { territories: [2] },
    ),
    faker.trip([
      {
        is_driver: true,
        identity_uuid: '4',
        distance: 5000,
        acquisition_id: 3,
      },
      {
        is_driver: false,
        identity_uuid: '5',
        distance: 5000,
        acquisition_id: 3,
        seats: 2,
      },
    ]),
    faker.trip([
      {
        is_driver: true,
        identity_uuid: '6',
        distance: 7500,
        acquisition_id: 4,
      },
      {
        is_driver: false,
        identity_uuid: '7',
        distance: 7500,
        acquisition_id: 4,
        seats: 4,
      },
    ]),
    faker.trip([
      {
        is_driver: true,
        identity_uuid: '8',
        distance: 75000,
        acquisition_id: 5,
      },
      {
        is_driver: false,
        identity_uuid: '9',
        distance: 75000,
        acquisition_id: 5,
        seats: 2,
      },
    ]),
    faker.trip([
      {
        is_driver: true,
        identity_uuid: '10',
        distance: 750000,
        acquisition_id: 6,
      },
      {
        is_driver: false,
        identity_uuid: '11',
        distance: 750000,
        acquisition_id: 6,
        seats: 2,
      },
    ]),
  ];

  const { up, down, get } = helper();
  let engine: PolicyEngine;
  let policy_id: number;

  before(async () => {
    ({ engine, policy_id } = await up(template));
  });
  after(async () => {
    await down();
  });

  it('should work', async () => {
    const results = [];
    for (const trip of trips) {
      const r = await engine.process(trip);
      results.push(...r);
    }
    expect(results).to.deep.members([
      { policy_id, acquisition_id: 3, identity_uuid: '4', amount: 100 },
      { policy_id, acquisition_id: 3, identity_uuid: '5', amount: 50 },
      { policy_id, acquisition_id: 4, identity_uuid: '6', amount: 300 },
      { policy_id, acquisition_id: 4, identity_uuid: '7', amount: 75 },
      { policy_id, acquisition_id: 5, identity_uuid: '8', amount: 1000 },
      { policy_id, acquisition_id: 5, identity_uuid: '9', amount: 500 },
    ]);
  });
});
