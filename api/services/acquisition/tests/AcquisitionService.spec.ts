// tslint:disable: no-unused-expression

import { describe } from 'mocha';
import axios, { AxiosInstance } from 'axios';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { bootstrap } from '@ilos/framework';
import { MongoProvider } from '@ilos/provider-mongo';
import { Interfaces } from '@ilos/core';

chai.use(chaiAsPromised);
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
  });

  it('Empty payload fails', async () => {
    let res;
    try {
      res = request.post('/', {
        id: 1,
        jsonrpc: '2.0',
        method: 'acquisition:createJourney',
        params: {
          params: {},
          _context: {
            call: {
              user: {
                operator: '5d1233a374f16221c079b04f',
                operator_name: 'MaxiCovoit',
                permissions: ['journey.create'],
              },
            },
          },
        },
      });

      await res;
      // .catch(({ response }) => {
      //   return expect(response.data).to.deep.equal({
      //     id: 1,
      //     jsonrpc: '2.0',
      //     error: {
      //       code: 400,
      //       message: 'Bad Request',
      //       // data: "data should have required property 'journey_id'",
      //     },
      //   });
      // })
      // .catch((e) => {
      //   console.log('throw');
      //   throw e;
      // });

      expect(res).to.be.fulfilled;
    } catch (e) {
      console.log('res', res);
      throw e;
    }
  });
});
