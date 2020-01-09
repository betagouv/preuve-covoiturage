import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { CampaignMetadataRepositoryProviderInterfaceResolver, CampaignInterface, MetaInterface } from '../interfaces';
import { PolicyEngine } from './PolicyEngine';
import { faker } from './helpers/faker';
import { MetadataWrapper } from './MetadataWrapper';

chai.use(chaiAsPromised);
const { expect } = chai;

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
        slug: 'per_km',
        parameters: true,
      },
      {
        slug: 'fixed_amount',
        parameters: 10,
      },
    ],
  ],
};

class CampaignMetadataRepositoryProvider extends CampaignMetadataRepositoryProviderInterfaceResolver {
  async get(id: number, key = 'default'): Promise<MetaInterface> {
    return new MetadataWrapper(id, key, {});
  }
  async set(meta: MetaInterface): Promise<void> {
    return;
  }
}

describe('Policy engine', () => {
  const engine: PolicyEngine = new PolicyEngine(new CampaignMetadataRepositoryProvider());

  it('works', async () => {
    const trip = faker.trip([{}], {
      territories: [territory],
      datetime: start,
    });

    const result = await engine.process(trip, fakeCampaign);
    expect(result).to.be.an('array');
    expect(result.length).to.eq(1);
    expect(result[0].policy_id).to.eq(fakeCampaign._id);
    // expect(result[0].trip).to.eq(trip._id);
    // expect(result[0].person).to.eq(trip.people[1].identity.phone);
    expect(result[0].amount).to.eq(((trip.people[0].distance / 1000) * fakeCampaign.rules[0][1].parameters) as number);
  });
});
