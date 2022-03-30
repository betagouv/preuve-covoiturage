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
          slug: 'date_modifier_meta',
          parameters: {
            dates: ['2021-01-02'],
            coef: 2.5,
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
          slug: 'date_filter',
          parameters: {
            blacklist: ['2021-01-02'],
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
    ],
  });
  const trip = faker.trip([
    { distance: 15000, datetime: new Date('2021-01-02') },
    { distance: 15000, datetime: new Date('2021-01-03') },
  ]);

  return { campaign, trip };
}

test('should multiply if in date', async (t) => {
  const { campaign, trip } = setup();
  const data = {
    trip,
    stack: [],
    person: trip[0],
  };

  const incentive = campaign.apply(data);

  t.is(incentive.result, 15 * 30 * 2.5);
});

test('should not multiply if in not date', async (t) => {
  const { campaign, trip } = setup();
  const data = {
    trip,
    stack: [],
    person: trip[1],
  };

  const incentive = campaign.apply(data);

  t.is(incentive.result, 15 * 30);
});
