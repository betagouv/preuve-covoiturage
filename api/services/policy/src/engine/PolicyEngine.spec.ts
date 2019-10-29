import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Kernel } from '@ilos/framework';
import { MongoConnection } from '@ilos/connection-mongo';
import { kernel as kernelDecorator } from '@ilos/common';

import { ServiceProvider } from '../ServiceProvider';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { PolicyEngine } from './PolicyEngine';
import { TripInterface } from '@pdc/provider-schema/dist';

chai.use(chaiAsPromised);
const { expect } = chai;

const start = new Date();
start.setMonth(start.getMonth() + 1);

const end = new Date();
end.setMonth(start.getMonth() + 2);

const territory = '5cef990d133992029c1abe44';

const fakeCampaign = {
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

@kernelDecorator({ children: [ServiceProvider] })
class CustomKernel extends Kernel {}

const kernel = new CustomKernel();

let db;
let engine;

describe('Policy engine', () => {
  let id;

  before(async () => {
    process.env.APP_MONGO_DB = 'pdc-test-policy-' + new Date().getTime();

    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);
    await kernel.bootstrap();

    db = kernel
      .get(ServiceProvider)
      .get(MongoConnection)
      .getClient();

    engine = kernel.get(ServiceProvider).get(PolicyEngine);
  });

  after(async () => {
    await db.db(process.env.APP_MONGO_DB).dropDatabase();
    await kernel.shutdown();
  });

  beforeEach(async () => {
    const data = await kernel
      .get(ServiceProvider)
      .get(CampaignRepositoryProviderInterfaceResolver)
      .create(fakeCampaign);
    id = data._id;
  });

  afterEach(async () => {});

  it('works', async () => {
    const trip: TripInterface = {
      start,
      _id: 'mytrip',
      operator_id: ['operatorA'],
      territories: [territory],
      status: '',
      people: [
        {
          is_driver: true,
          identity: {
            phone: '0102030405',
            over_18: false,
          },
          operator_class: 'A',
          operator_id: 'operatorA',

          start: {
            datetime: start,
            // lat?: number;
            // lon?: number;
            // insee?: string;
            // postcodes?: string[];
            // town?: string;
            // country?: string;
            // literal?: string;
            // territory?: string;
          },
          end: {
            datetime: start,
            // lat?: number;
            // lon?: number;
            // insee?: string;
            // postcodes?: string[];
            // town?: string;
            // country?: string;
            // literal?: string;
            // territory?: string;
          },
          distance: 50,
          duration: 10000,
          seats: 0,
          contribution: 10,
          revenue: 0,
          expense: 0,
          incentives: [],
          payments: [],
          calc_distance: 0,
          calc_duration: 0,
        },
        {
          is_driver: false,
          identity: {
            phone: '0102030405',
            over_18: true,
          },
          operator_class: 'B',
          operator_id: 'operatorB',

          start: {
            datetime: start,
            // lat?: number;
            // lon?: number;
            // insee?: string;
            // postcodes?: string[];
            // town?: string;
            // country?: string;
            // literal?: string;
            // territory?: string;
          },
          end: {
            datetime: start,
            // lat?: number;
            // lon?: number;
            // insee?: string;
            // postcodes?: string[];
            // town?: string;
            // country?: string;
            // literal?: string;
            // territory?: string;
          },
          distance: 10000,
          duration: 10000,
          seats: 0,
          contribution: 10,
          revenue: 0,
          expense: 0,
          incentives: [],
          payments: [],
          calc_distance: 0,
          calc_duration: 0,
        },
      ],
    };

    const applicableCampaigns = await kernel
      .get(ServiceProvider)
      .get(CampaignRepositoryProviderInterfaceResolver)
      .findApplicableCampaigns(trip.territories, trip.start);

    expect(applicableCampaigns).to.be.an('array');
    expect(applicableCampaigns.length).to.be.eq(1);

    const result = await engine.process(trip);
    expect(result).to.be.an('array');
    expect(result.length).to.eq(1);
    expect(result[0].campaign).to.eq(id);
    expect(result[0].trip).to.eq(trip._id);
    expect(result[0].person).to.eq(trip.people[1].identity.phone);
    expect(result[0].amount).to.eq((trip.people[1].distance / 1000) * <number>fakeCampaign.rules[0][1].parameters);
  });
});
