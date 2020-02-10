import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { PostgresConnection } from '@ilos/connection-postgres';

import { bootstrap } from '../src/bootstrap';
import { ServiceProvider } from '../src/ServiceProvider';
import { CampaignRepositoryProviderInterfaceResolver } from '../src/interfaces/CampaignRepositoryProviderInterface';
import { CreateCampaignAction } from '../src/actions/CreateCampaignAction';
import { CampaignPgRepositoryProvider } from '../src/providers/CampaignPgRepositoryProvider';

chai.use(chaiAsPromised);
const { expect } = chai;

const start = new Date();
start.setMonth(start.getMonth() + 1);

const end = new Date();
end.setMonth(start.getMonth() + 2);

const territory = 1;
const fakeCampaign = {
  territory_id: territory,
  name: 'Ma campagne',
  description: 'Incite les covoitureurs',
  start_date: start.toISOString(),
  end_date: end.toISOString(),
  unit: 'euro',
  status: 'draft',
  global_rules: [],
  rules: [
    [
      {
        slug: 'adult_only_filter',
      },
    ],
  ],
};

let db: PostgresConnection;

describe('Campaign service', () => {
  const ids: number[] = [];
  let transport;
  let request;
  let _id;
  let repository: CampaignPgRepositoryProvider;

  const callFactory = (method: string, data: any, permissions: string[]): object => ({
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
            territory_id: territory,
          },
        },
      },
    },
  });

  before(async () => {
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    transport = await bootstrap.boot('http', 0);
    request = supertest(transport.getInstance());
    db = transport
      .getKernel()
      .get(ServiceProvider)
      .get(PostgresConnection);

    repository = transport
      .getKernel()
      .get(ServiceProvider)
      .get(CampaignPgRepositoryProvider);
  });

  after(async () => {
    for (const id of ids) {
      await db.getClient().query({
        text: `DELETE from ${repository.table} WHERE _id = $1`,
        values: [id],
      });
    }

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
            territory_id: 2,
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
        expect(response.body.error.data).to.eq(
          JSON.stringify([
            {
              keyword: 'enum',
              dataPath: '.status',
              schemaPath: '#/properties/status/enum',
              params: {
                allowedValues: ['draft', 'template'],
              },
              message: 'should be equal to one of the allowed values',
              schema: ['draft', 'template'],
              parentSchema: {
                type: 'string',
                enum: ['draft', 'template'],
              },
              data: 'other',
            },
          ]),
        );
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
        ids.push(_id);
      })
      .end((err, res) => {
        if (err) {
          done(err);
        }

        repository.find(_id).then((data) => {
          expect(_id).to.eq(data._id);
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
        repository.find(_id).then((data) => {
          expect(data.name).to.eq('Ma nouvelle campagne');
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
      .send(
        callFactory(
          'campaign:list',
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
        const fakeCampaign = response.body.result.filter((c) => {
          return c._id === _id;
        });
        expect(fakeCampaign).to.be.an('array');
        expect(fakeCampaign.length).to.be.eq(1);
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

    const { _id: idOne } = await createCampaignAction.handle({
      ...fakeCampaign,
      status: 'template',
    });
    ids.push(idOne);

    const { _id: idTwo } = await createCampaignAction.handle({
      ...fakeCampaign,
      territory_id: null,
      status: 'template',
      name: generalName,
    });
    ids.push(idTwo);

    // Check campaign template 2
    await request
      .post('/')
      .send(callFactory('campaign:templates', {}, ['incentive-campaign.templates']))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.be.an('array');
        expect(response.body.result.filter((c) => c._id === idTwo).length).to.eq(1);
      });
  });
});
