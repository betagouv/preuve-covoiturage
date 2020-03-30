import supertest from 'supertest';
import path from 'path';
import { describe } from 'mocha';
import { PostgresConnection } from '@ilos/connection-postgres';

import { bootstrap } from '../bootstrap';

describe('toto', () => {
  let transport;
  let request;
  let connection: PostgresConnection;

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

    connection = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
    await connection.up();
  });

  after(async () => {
    await transport.down();
    connection.down();
  });

  it('couple', async () => {
    return request
      .post('/')
      .send(
        callFactory(
          'normalization:process',
          {
            name: 'Toto',
            legal_name: 'Toto inc.',
            siret: `${String(Math.random() * Math.pow(10, 16)).substr(0, 14)}`,
          },
          ['normalization.process'],
        ),
      )
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect((response: supertest.Response) => {
        console.log('response : ', response);
        // _id = response.body.result._id;
      });
  });
});
