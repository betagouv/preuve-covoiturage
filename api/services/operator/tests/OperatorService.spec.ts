// tslint:disable max-classes-per-file
import axios from 'axios';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Exceptions } from '@ilos/core';
import { bootstrap } from '@ilos/framework';
import { MongoProvider } from '@ilos/provider-mongo';

let transport;
let request;

chai.use(chaiAsPromised);

const { expect } = chai;
const port = '8081';

const errorFactory = (err: Exceptions.RPCException) => ({
  status: 200,
  data: {
    jsonrpc: '2.0',
    id: 1,
    error: {
      code: err.rpcError.code,
      message: err.rpcError.message,
      data: err.rpcError.data,
    },
  },
});

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
    process.env.APP_MONGO_URL = 'mongodb://mongo:mongo@localhost:27017/pdc-test?authSource=admin';
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

  it('should validate request on create', async () => {
    await expect(
      request.post(
        '/',
        callFactory(
          'operator:create',
          {
            nom_commercial: 10,
            raison_sociale: 'Toto inc.',
          },
          ['operator.create'],
        ),
      ),
    ).to.eventually.deep.include(
      errorFactory(
        new Exceptions.InvalidParamsException(
          'data.nom_commercial should be string, data.nom_commercial should pass "macro" keyword validation',
        ),
      ),
    );
  });

  it('should validate permission on create', async () => {
    await expect(
      request.post(
        '/',
        callFactory(
          'operator:create',
          {
            nom_commercial: 'Toto',
            raison_sociale: 'Toto inc.',
          },
          ['operator.list'],
        ),
      ),
    ).to.eventually.deep.include(errorFactory(new Exceptions.ForbiddenException('Invalid permissions')));
  });

  it('should work', async () => {
    let _id: string;
    let patchedName: string;

    try {
      // Create an operator
      const { status: createStatus, data: createData } = await request.post(
        '/',
        callFactory(
          'operator:create',
          {
            nom_commercial: 'Toto',
            raison_sociale: 'Toto inc.',
          },
          ['operator.create'],
        ),
      );
      _id = createData.result._id;
      const nom_commercial = createData.result.nom_commercial;
      expect(createStatus).equal(200);
      expect(nom_commercial).to.eq('Toto');
    } catch (e) {
      console.log('CREATE', e.message);
      throw e;
    }

    try {
      // Update an operator
      const { status: patchStatus, data: patchData } = await request.post(
        '/',
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
      );

      patchedName = patchData.result.nom_commercial;
      expect(patchStatus).equal(200);
      expect(patchedName).to.eq('Yop');
    } catch (e) {
      console.log('PATCH', e.message);
      throw e;
    }

    try {
      const { status: listStatus, data: listData } = await request.post(
        '/',
        callFactory('operator:all', {}, ['operator.list']),
      );
      const list = listData.result;
      expect(listStatus).equal(200);
      expect(list.length).eq(1);
      expect(list[0].nom_commercial).eq(patchedName);
    } catch (e) {
      console.log('FIND', e.message);
      throw e;
    }

    // delete the operator
    try {
      const { status: deleteStatus, data: deleteData } = await request.post(
        '/',
        callFactory(
          'operator:delete',
          {
            _id,
          },
          ['operator.delete'],
        ),
      );
      expect(deleteStatus).equal(200);
      expect(deleteData.result).equal(true);
    } catch (e) {
      console.log('DELETE', e.message);
      throw e;
    }
  });
});
