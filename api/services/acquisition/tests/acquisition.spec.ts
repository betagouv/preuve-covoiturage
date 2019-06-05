import { describe } from 'mocha';
import axios from 'axios';
import chai from 'chai';
import { bootstrap } from '@pdc/core';

const { expect } = chai;
const port = '8081';

let transport;
let request;

describe('Acquisition service', async () => {
  before(async () => {
    transport = await bootstrap.boot(['', '', 'http', port]);
    // request = supertest(transport.server);
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
    await transport.down();
  });

  it('works', async () => {
    const response = await request.post('/', {
      id: 1,
      jsonrpc: '2.0',
      method: 'acquisition:createJourney',
      params: {
      },
    });
    expect(response.status).equal(200);
  });
});
