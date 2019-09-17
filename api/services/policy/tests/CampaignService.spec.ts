import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { MongoConnection } from '@ilos/connection-mongo';
import { CampaignInterface } from '@pdc/provider-schema';

import { bootstrap } from '../src/bootstrap';
import { ServiceProvider } from '../src/ServiceProvider';
import { CampaignRepositoryProviderInterfaceResolver } from '../src/interfaces/CampaignRepositoryProviderInterface';

chai.use(chaiAsPromised);
const { expect } = chai;

const territory = '5cef990d133992029c1abe44';
const fakeCampaign = {
  territory_id: territory,
  name: 'Ma campagne',
  description: 'Incite les covoitureurs',
  start: '2019-09-07T00:00:00.000Z',
  end: '2019-10-07T00:00:00.000Z',
  unit: 'euro',
  status: 'draft',
  filters: {},
  retribution_rules: [
    {
      slug: 'adult_only',
      parameters: true,
    },
  ],
};

let db;

describe('Campaign service', () => {
  let transport;
  let request;

  const callFactory = (method: string, data: any, permissions: string[]) => ({
    method,
    id: 1,
    jsonrpc: '2.0',
    params: {
      params: data,
      _context: {
        channel: {
          service: 'proxy',
          transport: 'http',
        },
        call: {
          user: {
            permissions,
            territory,
          },
        },
      },
    },
  });

  before(async () => {
    process.env.APP_MONGO_DB = 'pdc-test-policy-' + new Date().getTime();

    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    transport = await bootstrap.boot('http', 0);
    request = supertest(transport.getInstance());
    db = transport
      .getKernel()
      .get(ServiceProvider)
      .get(MongoConnection)
      .getClient();
  });

  after(async () => {
    await db.db(process.env.APP_MONGO_DB).dropDatabase();

    await transport.down();
  });

  it('Fails on wrong permissions', () => {
    return request
      .post('/')
      .send(callFactory('campaign:create', fakeCampaign, ['wrong.permission']))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(403);
        expect(response.body).to.have.property('error');
        expect(response.body.error.data).to.eq('Invalid permissions');
      });
  });

  it('Fails on wrong territory id', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'campaign:create',
          {
            ...fakeCampaign,
            territory_id: '5cef990d133992029c1abe55',
          },
          ['incentive-campaign.create'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(403);
        expect(response.body).to.have.property('error');
        expect(response.body.error.data).to.eq('Invalid permissions');
      });
  });

  it('Fails on wrong input', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'campaign:create',
          {
            ...fakeCampaign,
            status: 'other',
          },
          ['incentive-campaign.create'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
        expect(response.body.error.data).to.eq('data.status should be equal to constant');
      });
  });

  it('Create a policy', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'campaign:create',
          {
            ...fakeCampaign,
          },
          ['incentive-campaign.create'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect(async (response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id');

        const _id = response.body.result._id;
        const dbEntry = await transport
          .getKernel()
          .get(ServiceProvider)
          .get(CampaignRepositoryProviderInterfaceResolver)
          .find(_id);
        expect(_id).to.eq(dbEntry._id);
      });
  });
});
