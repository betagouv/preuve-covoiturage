import test from 'ava';

import { faker } from './helpers/faker';
import { CampaignInterface } from '../interfaces';
import { MetadataProviderInterfaceResolver, MetaInterface } from './interfaces';
import { PolicyEngine } from './PolicyEngine';
import { MetadataWrapper } from './meta/MetadataWrapper';

function setup(): { engine: PolicyEngine; start: Date; fakeCampaign: CampaignInterface } {
  const start = new Date('2019-01-01');
  const end = new Date('2019-03-01');

  const territory = 1;

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
      ],
    ],
  };

  class CampaignMetadataRepositoryProvider extends MetadataProviderInterfaceResolver {
    async get(id: number, keys = ['default']): Promise<MetaInterface> {
      return new MetadataWrapper(id, []);
    }
    async set(id: number, meta: MetaInterface): Promise<void> {
      return;
    }
  }
  const engine: PolicyEngine = new PolicyEngine(new CampaignMetadataRepositoryProvider());

  return { engine, start, fakeCampaign };
}

test('should boot', async (t) => {
  const { engine, start, fakeCampaign } = setup();
  const trip = faker.trip([{}], {
    datetime: start,
  });

  const result = await engine.process(trip, fakeCampaign);

  t.true(Array.isArray(result));
  t.is(result.length, 1);
  t.true(Reflect.ownKeys(result[0]).indexOf('policy_id') >= 0);
  t.is(result[0].policy_id, fakeCampaign._id);
  t.true(Reflect.ownKeys(result[0]).indexOf('amount') >= 0);
  t.is(result[0].amount, ((trip.people[0].distance / 1000) * fakeCampaign.rules[0][1].parameters) as number);
});
