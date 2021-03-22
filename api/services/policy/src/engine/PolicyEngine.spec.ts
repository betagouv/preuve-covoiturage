import test from 'ava';

import { faker } from './helpers/faker';
import { CampaignInterface } from '../interfaces';
import { MetadataProviderInterfaceResolver, MetaInterface } from './interfaces';
import { PolicyEngine } from './PolicyEngine';
import { MetadataWrapper } from './meta/MetadataWrapper';
import { RuleInterface } from '../shared/common/interfaces/RuleInterface';

function setup(rules: RuleInterface[] = []): { engine: PolicyEngine; start: Date; fakeCampaign: CampaignInterface } {
  const start = new Date('2019-01-01');
  const end = new Date('2019-03-01');

  const territory = 1;
  const meta = new MetadataWrapper(1, []);
  const fakeCampaign: CampaignInterface = {
    _id: 1,
    territory_id: territory,
    name: 'Ma campagne',
    description: 'Incite les covoitureurs',
    start_date: start,
    end_date: end,
    unit: 'euro',
    status: 'active',
    global_rules: [
      {
        slug: 'adult_only_filter',
        parameters: true,
      },
      ...rules,
    ],
    rules: [
      [
        {
          slug: 'per_km_modifier',
          parameters: true,
        },
        {
          slug: 'fixed_amount_setter',
          parameters: 10,
        },
        {
          slug: 'passenger_only_filter',
        },
      ],
      [
        {
          slug: 'per_km_modifier',
          parameters: true,
        },
        {
          slug: 'fixed_amount_setter',
          parameters: 20,
        },
        {
          slug: 'driver_only_filter',
        },
      ],
    ],
  };

  class CampaignMetadataRepositoryProvider extends MetadataProviderInterfaceResolver {
    async get(id: number, keys = ['default']): Promise<MetaInterface> {
      return meta;
    }
    async set(id: number, meta: MetaInterface): Promise<void> {
      return;
    }
  }
  const engine: PolicyEngine = new PolicyEngine(new CampaignMetadataRepositoryProvider());

  return { engine, start, fakeCampaign };
}

test('should boot', async (t) => {
  const { engine, fakeCampaign } = setup();
  const trip = faker.trip([{}]);
  const campaign = engine.buildCampaign(fakeCampaign);
  const result = await engine.process(campaign, trip);

  t.true(Array.isArray(result));
  t.is(result.length, 1);
  t.true(Reflect.ownKeys(result[0]).indexOf('policy_id') >= 0);
  t.is(result[0].policy_id, fakeCampaign._id);
  t.true(Reflect.ownKeys(result[0]).indexOf('amount') >= 0);
  t.is(result[0].amount, ((trip[0].distance / 1000) * fakeCampaign.rules[0][1].parameters) as number);
});

test('should work and distribute incentive', async (t) => {
  const { engine, fakeCampaign } = setup();
  const trip = faker.trip([
    {
      carpool_id: 1,
      is_driver: false,
      distance: 1000,
    },
    {
      carpool_id: 2,
      is_driver: true,
      distance: 2000,
    },
    {
      carpool_id: 3,
      is_driver: false,
      distance: 3000,
    },
    {
      carpool_id: 4,
      is_driver: true,
      distance: 4000,
    },
  ]);
  const campaign = engine.buildCampaign(fakeCampaign);
  const result = await engine.process(campaign, trip);

  t.log(result);
  t.true(Array.isArray(result));
  t.is(result.length, 4);
  t.is(result.find((p) => p.carpool_id === 1).amount, (1000 / 1000) * 10);
  t.is(result.find((p) => p.carpool_id === 2).amount, ((4000 / 1000) * 20) / 2);
  t.is(result.find((p) => p.carpool_id === 3).amount, (3000 / 1000) * 10);
  t.is(result.find((p) => p.carpool_id === 4).amount, ((4000 / 1000) * 20) / 2);
});

test('should work with amount restriction', async (t) => {
  const { engine, fakeCampaign } = setup([
    {
      slug: 'max_amount_restriction',
      parameters: {
        target: 'driver',
        amount: 50,
        period: 'day',
        uuid: 'amount_uuid',
      },
    },
  ]);
  const trip = faker.trip([
    {
      carpool_id: 1,
      is_driver: false,
      distance: 1000,
      identity_uuid: 'passenger_1',
    },
    {
      carpool_id: 2,
      is_driver: true,
      distance: 2000,
      identity_uuid: 'driver',
    },
    {
      carpool_id: 3,
      is_driver: false,
      distance: 3000,
      identity_uuid: 'passenger_2',
    },
    {
      carpool_id: 4,
      is_driver: true,
      distance: 4000,
      identity_uuid: 'driver',
    },
  ]);

  const campaign = engine.buildCampaign(fakeCampaign);
  const result = await engine.process(campaign, trip);

  t.log(result);
  t.true(Array.isArray(result));
  t.is(result.length, 4);
  t.is(result.find((p) => p.carpool_id === 1).amount, (1000 / 1000) * 10);
  t.is(result.find((p) => p.carpool_id === 2).amount, ((4000 / 1000) * 20) / 2);
  t.is(result.find((p) => p.carpool_id === 3).amount, (3000 / 1000) * 10);
  t.is(result.find((p) => p.carpool_id === 4).amount, 10);
});

test('should work with trip restriction', async (t) => {
  const { engine, fakeCampaign } = setup([
    {
      slug: 'max_trip_restriction',
      parameters: {
        target: 'driver',
        amount: 1,
        period: 'day',
        uuid: 'trip_uuid',
      },
    },
  ]);
  const trip = faker.trip([
    {
      carpool_id: 1,
      is_driver: false,
      distance: 1000,
      identity_uuid: 'passenger_1',
    },
    {
      carpool_id: 2,
      is_driver: true,
      distance: 2000,
      identity_uuid: 'driver',
    },
    {
      carpool_id: 3,
      is_driver: false,
      distance: 3000,
      identity_uuid: 'passenger_2',
    },
    {
      carpool_id: 4,
      is_driver: true,
      distance: 4000,
      identity_uuid: 'driver',
    },
  ]);
  const campaign = engine.buildCampaign(fakeCampaign);
  const result = await engine.process(campaign, trip);

  t.log(result);
  t.true(Array.isArray(result));
  t.is(result.length, 4);
  t.is(result.find((p) => p.carpool_id === 1).amount, (1000 / 1000) * 10);
  t.is(result.find((p) => p.carpool_id === 2).amount, ((4000 / 1000) * 20) / 2);
  t.is(result.find((p) => p.carpool_id === 3).amount, (3000 / 1000) * 10);
  t.is(result.find((p) => p.carpool_id === 4).amount, ((4000 / 1000) * 20) / 2);
});
