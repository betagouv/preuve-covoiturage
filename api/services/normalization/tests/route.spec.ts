// tslint:disable: no-unused-expression
import supertest from 'supertest';
import path from 'path';
import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import { bootstrap } from '../src/bootstrap';

chai.use(chaiAsPromised);
const { expect } = chai;

describe('Normalization Route', () => {
  let transport;
  let request;

  before(async () => {
    const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
    process.env.APP_CONFIG_DIR = path.join('..', 'dist', configDir);

    transport = await bootstrap.boot('http', 0);
    request = supertest(transport.getInstance());
  });

  after(async () => {
    await transport.down();
  });

  it('succeeds in Metropole', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'normalization:route',
        params: {
          params: {
            passenger: {
              start: { lon: 2.264493, lat: 48.819279 },
              end: { lon: 2.341736, lat: 48.826455 },
            },
            driver: {
              start: { lon: 0.13076, lat: 47.287335 },
              end: { lon: -0.039585, lat: 48.084472 },
            },
          },
          _context: {
            channel: {
              service: 'normalization',
              transport: 'queue',
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-type', 'application/json')
      .expect((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('result');

        expect(response.body.result).to.have.property('passenger');
        expect(response.body.result.passenger).to.have.property('calc_distance', 6903.9);
        expect(response.body.result.passenger).to.have.property('calc_duration', 698.4);

        expect(response.body.result).to.have.property('driver');
        expect(response.body.result.driver).to.have.property('calc_distance', 135530.5);
        expect(response.body.result.driver).to.have.property('calc_duration', 5979.6);
      }));

  it('succeeds in La Réunion and La Martinique', () =>
    request
      .post('/')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'normalization:route',
        params: {
          params: {
            passenger: {
              start: { lon: 55.246518, lat: -21.042936 },
              end: { lon: 55.415603, lat: -21.246847 },
            },
            driver: {
              start: { lon: -61.066241, lat: 14.634548 },
              end: { lon: -60.937572, lat: 14.56199 },
            },
          },
          _context: {
            channel: {
              service: 'normalization',
              transport: 'queue',
            },
          },
        },
      })
      .set('Accept', 'application/json')
      .set('Content-type', 'application/json')
      .expect((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('result');

        expect(response.body.result).to.have.property('passenger');
        expect(response.body.result.passenger).to.have.property('calc_distance', 43728.7);
        expect(response.body.result.passenger).to.have.property('calc_duration', 2201);

        expect(response.body.result).to.have.property('driver');
        expect(response.body.result.driver).to.have.property('calc_distance', 21274.2);
        expect(response.body.result.driver).to.have.property('calc_duration', 1776.1);
      }));
});
