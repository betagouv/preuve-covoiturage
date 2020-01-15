import path from 'path';
import chai from 'chai';
import supertest from 'supertest';
import { describe } from 'mocha';
import { TokenProvider } from '@pdc/provider-token';
import { ConfigInterface } from '@ilos/common';

import { HttpTransport } from '../src/HttpTransport';
import { Kernel } from '../src/Kernel';
import { requestJourney } from './mocks/requestJourneyV2';

const { expect } = chai;

describe('Send journey using application token', async () => {
  // fake Config provider
  class Config implements ConfigInterface {
    private config: Map<string, any> = new Map();
    async init(): Promise<void> {
      this.config.set('jwt.secret', 'abcd1234');
      this.config.set('jwt.ttl', -1);
      this.config.set('jwt.alg', 'HS256');
      this.config.set('jwt.signOptions', {});
      this.config.set('jwt.verifyOptions', {});
    }
    loadConfigDirectory(workingPath: string, configDir?: string): void {}
    get(key: string, fallback?: any): any {
      return this.config.get(key);
    }
    set<T>(key: string, value: T): T {
      throw new Error('Not implemented in tests');
    }
  }

  const kernel = new Kernel();
  const app = new HttpTransport(kernel);
  let request;
  let token;
  let operator;
  let application;

  const tokenProvider = new TokenProvider(new Config());
  await tokenProvider.init();

  before(async () => {
    process.env.APP_MONGO_DB = `pdc-test-server-${new Date().getTime()}`;
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    await kernel.bootstrap();
    await app.up(['0']);

    request = supertest(app.app);

    operator = await kernel.call(
      'operator:create',
      {
        nom_commercial: 'Maxi covoit',
        raison_sociale: 'Maxi covoit inc.',
      },
      {
        call: { user: { permissions: ['operator.create'] } },
        channel: {
          service: 'operator',
          transport: 'http',
        },
      },
    );

    application = await kernel.call(
      'application:create',
      {
        name: 'Application',
        operator_id: operator._id.toString(),
        permissions: ['journey.create'],
      },
      {
        call: {
          user: { permissions: ['application.create'] },
        },
        channel: {
          service: 'application',
          transport: 'http',
        },
      },
    );

    token = await tokenProvider.sign({
      a: application._id.toString(),
      o: application.operator_id,
      s: 'operator',
      p: application.permissions,
      v: 2,
    });
  });

  after(async () => {
    await app.down();
  });

  it('REST', async () => {
    return request
      .post('/journeys/push')
      .send(requestJourney)
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-type', 'application/json')
      .expect((response: supertest.Response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('sha256');
        expect(response.body).to.have.property('payload');
        expect(response.body.payload).to.have.property('data');
        expect(response.body.payload.data).to.have.property('result');
        expect(response.body.payload.data.result).to.have.property('operator_id', application.operator_id);
      });
  });

  it('RPC', async () => {
    return request
      .post('/rpc')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'acquisition:create',
        params: {
          params: requestJourney,
        },
      })
      .set('Authorization', `Bearer ${token}`)
      .set('Accept', 'application/json')
      .set('Content-type', 'application/json')
      .expect((response: supertest.Response) => {
        // TODO detect error
        // console.log(response.body);
        // expect(response.status).to.eq(200);
        // expect(response.body).to.have.property('sha256');
        // expect(response.body).to.have.property('payload');
        // expect(response.body.payload).to.have.property('data');
        // expect(response.body.payload.data).to.have.property('result');
        // expect(response.body.payload.data.result).to.have.property('operator_id', application.operator_id);
      });
  });
});
