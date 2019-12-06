import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Kernel } from '@ilos/framework';
import { PostgresConnection } from '@ilos/connection-postgres';
import { kernel as kernelDecorator } from '@ilos/common';

import { ServiceProvider } from '../ServiceProvider';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { PolicyEngine } from './PolicyEngine';
import { CampaignPgRepositoryProvider } from '../providers/CampaignPgRepositoryProvider';

chai.use(chaiAsPromised);
const { expect } = chai;

const start = new Date('2019-01-01');
const end = new Date('2019-03-01');

const territory = 1;

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

describe('Policy engine', () => {
  const kernel = new CustomKernel();

  let db: PostgresConnection;
  let engine: PolicyEngine;
  let repository: CampaignPgRepositoryProvider;
  let id: number;

  before(async () => {
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);
    await kernel.bootstrap();

    db = kernel.get(ServiceProvider).get(PostgresConnection);

    engine = kernel.get(ServiceProvider).get(PolicyEngine);
    repository = kernel.get(ServiceProvider).get(CampaignPgRepositoryProvider);

    const data = await repository.create(fakeCampaign);
    id = data._id;
  });

  after(async () => {
    await db.getClient().query({
      text: `DELETE FROM ${repository.table} WHERE _id = $1`,
      values: [id],
    });
    await kernel.shutdown();
  });

  it('works', async () => {
    const trip = {
      start,
      _id: 1,
      operator_id: [1],
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
          operator_id: 1,

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
          operator_id: 2,

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
