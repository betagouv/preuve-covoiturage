import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { MongoConnection } from '@ilos/connection-mongo';

import { bootstrap } from '../src/bootstrap';
import { ServiceProvider } from '../src/ServiceProvider';
import { CampaignRepositoryProviderInterfaceResolver } from '../src/interfaces/CampaignRepositoryProviderInterface';
import { CreateCampaignAction } from '../src/actions/CreateCampaignAction';

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
  start: start.toISOString(),
  end: end.toISOString(),
  unit: 'euro',
  status: 'draft',
  global_rules: [],
  rules: [
    {
      slug: 'adult_only_filter',
      parameters: true,
    },
  ],
};

let db: MongoConnection;

describe('Campaign service', () => {
  let transport;
  let request;
  let _id;

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
      .get(MongoConnection);
  });

  after(async () => {
    await db
      .getClient()
      .db(process.env.APP_MONGO_DB)
      .dropDatabase();

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
        expect(response.body.error.data).to.eq('data.status should be equal to one of the allowed values');
      });
  });

  it('Create a campaign', (done) => {
    request
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
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id');
        expect(response.body.result).to.have.property('name');
        expect(response.body.result.name).to.eq(fakeCampaign.name);
        _id = response.body.result._id;
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }

        transport
          .getKernel()
          .get(ServiceProvider)
          .get(CampaignRepositoryProviderInterfaceResolver)
          .find(_id)
          .then((dbEntry) => {
            expect(_id).to.eq(dbEntry._id);
            done();
          });
      });
  });

  it('Patch a campaign', (done) => {
    request
      .post('/')
      .send(
        callFactory(
          'campaign:patch',
          {
            _id: _id,
            patch: {
              name: 'Ma nouvelle campagne',
            },
          },
          ['incentive-campaign.update'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id');
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }
        transport
          .getKernel()
          .get(ServiceProvider)
          .get(CampaignRepositoryProviderInterfaceResolver)
          .find(_id)
          .then((dbEntry) => {
            expect(dbEntry.name).to.eq('Ma nouvelle campagne');
            done();
          });
      });
  });

  it('Launch a campaign', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'campaign:launch',
          {
            _id: _id,
          },
          ['incentive-campaign.create'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('status');
        expect(response.body.result.status).to.eq('active');
      });
  });

  it('Fail launching campaign if not draft', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'campaign:launch',
          {
            _id: _id,
          },
          ['incentive-campaign.create'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.have.property('error');
      });
  });

  it('Listing campaign', () => {
    return request
      .post('/')
      .send(callFactory('campaign:list', {}, ['incentive-campaign.list']))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.be.an('array');
        expect(response.body.result.length).to.be.eq(1);
        expect(response.body.result[0]).to.have.property('_id');
        expect(response.body.result[0]._id).to.eq(_id);
      });
  });

  it('Fail delete campaign if not draft', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'campaign:delete',
          {
            _id: _id,
            territory_id: territory,
          },
          ['incentive-campaign.delete'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(404);
        expect(response.body).to.have.property('error');
      });
  });

  it('Delete draft campaign', async () => {
    await transport
      .getKernel()
      .get(ServiceProvider)
      .get(CampaignRepositoryProviderInterfaceResolver)
      .patch(_id, { status: 'draft' });

    return request
      .post('/')
      .send(
        callFactory(
          'campaign:delete',
          {
            _id: _id,
            territory_id: territory,
          },
          ['incentive-campaign.delete'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
      });
  });

  it('List campaign template', async () => {
    const generalName = 'Campagne exemple';
    const createCampaignAction = transport
      .getKernel()
      .get(ServiceProvider)
      .get(CreateCampaignAction);

    await createCampaignAction.handle({
      ...fakeCampaign,
      status: 'template',
    });

    await createCampaignAction.handle({
      ...fakeCampaign,
      territory_id: null,
      status: 'template',
      name: generalName,
    });

    await request
      .post('/')
      .send(
        callFactory(
          'campaign:listTemplate',
          {
            territory_id: null,
          },
          ['incentive-campaign.list'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.be.an('array');
        expect(response.body.result.length).to.eq(1);
        expect(response.body.result[0].name).to.eq(generalName);
      });

    await request
      .post('/')
      .send(
        callFactory(
          'campaign:listTemplate',
          {
            territory_id: territory,
          },
          ['incentive-campaign.list'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.be.an('array');
        expect(response.body.result.length).to.eq(1);
        expect(response.body.result[0].name).to.eq(fakeCampaign.name);
      });
  });
});
