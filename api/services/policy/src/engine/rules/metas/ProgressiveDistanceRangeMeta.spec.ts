import test from 'ava';

import { faker } from '../../helpers/faker';
import { ProcessableCampaign } from '../../ProcessableCampaign';
import { TripInterface } from '../../../interfaces';

function setup(): { campaign: ProcessableCampaign; trip: TripInterface } {
  const campaign = new ProcessableCampaign({
    territory_id: 1,
    name: 'test',
    description: '',
    start_date: new Date(),
    end_date: new Date(),
    unit: 'euro',
    status: 'draft',
    global_rules: [],
    rules: [
      [
        {
          slug: 'progressive_distance_range_meta',
          parameters: {
            min: 0,
            max: 1000,
          },
        },
        {
          slug: 'fixed_amount_setter',
          parameters: 30,
        },
        {
          slug: 'per_km_modifier',
        },
      ],
      [
        {
          slug: 'progressive_distance_range_meta',
          parameters: {
            min: 1000,
            max: 5000,
          },
        },
        {
          slug: 'fixed_amount_setter',
          parameters: 20,
        },
        {
          slug: 'per_km_modifier',
        },
      ],
      [
        {
          slug: 'progressive_distance_range_meta',
          parameters: {
            min: 5000,
            max: 10000,
          },
        },
        {
          slug: 'fixed_amount_setter',
          parameters: 10,
        },
        {
          slug: 'per_km_modifier',
        },
      ],
    ],
  });
  const trip = faker.trip([{ distance: 15000 }]);

  return { campaign, trip };
}

test('should work', async (t) => {
  const { campaign, trip } = setup();
  const data = {
    trip,
    stack: [],
    person: trip[0],
  };

  const incentive = await campaign.apply(data);

  t.is(
    incentive.result,
    1 * 30 + // de 0 à 1 km = 30cts
    4 * 20 + // de 1 à 5 km = 20cts
      5 * 10, // de 5 à 10 km = 10 cts
  );
});
