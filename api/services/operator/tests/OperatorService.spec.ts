import supertest from 'supertest';
import path from 'path';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { bootstrap } from '../src/bootstrap';

let transport;
let request;

chai.use(chaiAsPromised);

const { expect } = chai;
const port = '8085';

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
        },
      },
    },
  },
});

describe('Operator service', () => {
  before(async () => {
    process.env.APP_MONGO_DB = 'pdc-test-' + new Date().getTime();

    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    transport = await bootstrap.boot('http', port);
    request = supertest(transport.getInstance());
  });

  after(async () => {
    // TODO : refactor
    // await (<MongoConnection>transport
    //   .getKernel()
    //   .getContainer()
    //   .get(MongoConnection))
    //   .getClient()
    //   .db(process.env.APP_MONGO_DB)
    //   .dropDatabase();

    await transport.down();
  });

  it('Fails on wrong permissions', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'operator:create',
          {
            nom_commercial: 'Toto',
            raison_sociale: 'Toto inc.',
          },
          ['wrong.permission'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(503);
        expect(response.body).to.have.property('error');
        expect(response.body.error.data).to.eq('Invalid permissions');
      });
  });

  // id returned by database
  let _id: string;

  it('Creates an operator', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'operator:create',
          {
            nom_commercial: 'Toto',
            raison_sociale: 'Toto inc.',
          },
          ['operator.create'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id');
        expect(response.body.result).to.have.property('nom_commercial', 'Toto');
        expect(response.body.result).to.have.property('raison_sociale', 'Toto inc.');

        // store the _id
        _id = response.body.result._id;
      });
  });

  it('Updates the operator', () => {
    return request
      .post('/')
      .send(
        callFactory(
          'operator:patch',
          {
            _id,
            patch: {
              nom_commercial: 'Yop',
            },
          },
          ['operator.update'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result).to.have.property('_id', _id);
        expect(response.body.result).to.have.property('nom_commercial', 'Yop');
        expect(response.body.result).to.have.property('raison_sociale', 'Toto inc.');
      });
  });

  it('Lists all operators', () => {
    return request
      .post('/')
      .send(callFactory('operator:all', {}, ['operator.list']))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result');
        expect(response.body.result.length).to.eq(1);
        expect(response.body.result[0]).to.have.property('_id', _id);
        expect(response.body.result[0]).to.have.property('nom_commercial', 'Yop');
        expect(response.body.result[0]).to.have.property('raison_sociale', 'Toto inc.');
      });
  });

  it('Deletes the operator', () => {
    return request
      .post('/')
      .send(callFactory('operator:delete', { _id }, ['operator.delete']))
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('result', true);
      });
  });
});
