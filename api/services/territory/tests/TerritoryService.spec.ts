// tslint:disable max-classes-per-file
import axios from 'axios';
import chai from 'chai';
import chaiNock from 'chai-nock';
import { bootstrap } from '@ilos/framework';
import { MongoProvider } from '@ilos/provider-mongo';

let transport;
let request;

chai.use(chaiNock);

const { expect } = chai;
const port = '8081';

describe('Territory service', () => {
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

  it('create, update, delete territory', async () => {
    let _id: string;
    let patchedName: string;

    try {
      // Create a territory
      const { status: createStatus, data: createData } = await request.post('/', {
        id: 1,
        jsonrpc: '2.0',
        method: 'territory:create',
        params: {
          params: { name: 'Toto' },
          _context: {
            call: {
              user: {
                permissions: ['territory.create'],
              },
            },
          },
        },
      });

      _id = createData.result._id;
      expect(createData.result.name).to.eq('Toto');
      expect(createStatus).equal(200);
    } catch (e) {
      console.log('CREATE', e.message);
      throw e;
    }

    try {
      // patch the name
      const { status: patchStatus, data: patchData } = await request.post('/', {
        id: 1,
        jsonrpc: '2.0',
        method: 'territory:patch',
        params: {
          params: {
            _id,
            patch: {
              name: 'Yop',
            },
          },
          _context: {
            call: {
              user: {
                permissions: ['territory.update'],
              },
            },
          },
        },
      });

      patchedName = patchData.result.name;
      expect(patchedName).to.eq('Yop');
      expect(patchStatus).equal(200);
    } catch (e) {
      console.log('PATCH', e.message);
      throw e;
    }

    try {
      // list all territories and find the patched item
      const { status: listStatus, data: listData } = await request.post('/', {
        id: 1,
        jsonrpc: '2.0',
        method: 'territory:all',
        params: {
          _context: {
            call: {
              user: {
                permissions: ['territory.list'],
              },
            },
          },
        },
      });
      const list = listData.result;
      expect(list.length).eq(1);
      expect(list[0].name).eq(patchedName);
      expect(listStatus).equal(200);
    } catch (e) {
      console.log('FIND', e.message);
      throw e;
    }

    try {
      // delete the item
      const { status: deleteStatus, data: deleteData } = await request.post('/', {
        id: 1,
        jsonrpc: '2.0',
        method: 'territory:delete',
        params: {
          params: { _id },
          _context: {
            call: {
              user: {
                permissions: ['territory.delete'],
              },
            },
          },
        },
      });
      expect(deleteStatus).equal(200);
      expect(deleteData.result).equal(true);
    } catch (e) {
      console.log('DELETE', e.message);
      throw e;
    }
  });
});
