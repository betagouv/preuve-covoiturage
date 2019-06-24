import { describe } from 'mocha';
import axios, { AxiosInstance } from 'axios';
import chai from 'chai';
import { bootstrap } from '@ilos/framework';
import { MongoProvider } from '@ilos/provider-mongo';
import { Interfaces } from '@ilos/core';

const { expect } = chai;
const port = '8081';

let transport: Interfaces.TransportInterface;
let request: AxiosInstance;

describe('Acquisition service', async () => {
  before(async () => {
    process.env.APP_MONGO_DB = 'pdc-test-' + new Date().getTime();

    transport = await bootstrap.boot(['', '', 'http', port]);

    request = axios.create({
      baseURL: `http://127.0.0.1:${port}`,
      timeout: 1000,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });
  });

  after(async () => {
    await (<MongoProvider>transport
      .getKernel()
      .getContainer()
      .get(MongoProvider))
      .getDb(process.env.APP_MONGO_DB)
      .then((db) => db.dropDatabase());

    await transport.down();
    process.exit(0);
  });

  it('works', async () => {
    const response = await request.post('/', {
      id: 1,
      jsonrpc: '2.0',
      method: 'acquisition:createJourney',
      params: {},
    });
    expect(response.status).equal(200);
  });
});
