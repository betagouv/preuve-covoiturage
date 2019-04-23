import { describe } from 'mocha';
import { expect } from 'chai';
import supertest from 'supertest';

import { HttpTransport } from './HttpTransport';
import { RPCCallType } from '../types/RPCCallType';
import { RPCResponseType } from '../types/RPCResponseType';


let request;
let httpTransport;

before(() => {
  const kernel = {
    services: [],
    providers: [],
    boot() {},
    async handle(call: RPCCallType): Promise<RPCResponseType> {
      if ('method' in call && call.method === 'error') {
        throw new Error('wrong!');
      }

      const response = {
        id: 1,
        jsonrpc: '2.0',
        result: 'hello world',
      };
      return response;
    },
  };
  httpTransport = new HttpTransport(kernel);

  httpTransport.up();

  request = supertest(httpTransport.server);
});

describe('Http kernel', () => {
  it('should work', async () => {
    const response = await request.post('/')
        .send({
            id: 1,
            jsonrpc: '2.0',
            method: 'test',
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
    expect(response.status).equal(200);
    expect(response.body).to.deep.equal({
      id: 1,
      jsonrpc: '2.0',
      result: 'hello world',
    });
  });

  it('should fail if missing accept header', async () => {
    const response = await request.post('/')
        .send({
            id: 1,
            jsonrpc: '2.0',
            method: 'test',
        })
        .set('Content-Type', 'application/json');
    expect(response.status).equal(415);
  });

  it('should fail if missing content type header', async () => {
    const response = await request.post('/')
        .send({
            id: 1,
            jsonrpc: '2.0',
            method: 'test',
        })
        .set('Content-Type', 'application/json');
    expect(response.status).equal(415);
  });

  it('should fail if http verb is not POST', async () => {
    const response = await request.get('/')
        .send({
            id: 1,
            jsonrpc: '2.0',
            method: 'test',
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
    expect(response.status).equal(405);
  });

  it('should fail if json is misformed', async () => {
    const response = await request.post('/')
        .send('{ "id": 1, jsonrpc: "2.0", "method": "test"}')
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
    expect(response.status).equal(415);
  });

  it('should fail if service reject', async () => {
    const response = await request.post('/')
        .send({
            id: 1,
            jsonrpc: '2.0',
            method: 'error',
        })
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');
    expect(response.status).equal(500);
  });
});

after(() => {
  httpTransport.down();
});
