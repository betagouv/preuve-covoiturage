// tslint:disable max-classes-per-file
import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { bootstrap, Exceptions } from '@ilos/core';
import { MongoProvider } from '@pdc/provider-mongo';

let mongoServer;
let connectionString;
let dbName;
let kernel;
let transport;
let request;

chai.use(chaiAsPromised);

const { expect } = chai;
const port = '8081';

const errorFactory = (err: Exceptions.RPCException) => {
  return {
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
  };
};

const callFactory = (method: string, data: any, permissions: string[]) => ({
  id: 1,
  jsonrpc: '2.0',
  method: method,
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
    mongoServer = new MongoMemoryServer();
    connectionString = await mongoServer.getConnectionString();
    dbName = await mongoServer.getDbName();
    process.env.APP_MONGO_URL = connectionString;
    process.env.APP_MONGO_DB = dbName;
    transport = await bootstrap.boot(['', '', 'http', port]);
    kernel = transport.getKernel();
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
    await (<MongoProvider>kernel.getContainer().get(MongoProvider)).close();
    await transport.down();
    await mongoServer.stop();
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
      errorFactory(new Exceptions.InvalidParamsException('data.nom_commercial should be string')),
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
    const { _id, nom_commercial } = createData.result;
    expect(createStatus).equal(200);
    expect(nom_commercial).to.eq('Toto');

    const { status: patchStatus, data: patchData } = await request.post(
      '/',
      callFactory(
        'operator:patch',
        {
          id: _id,
          patch: {
            nom_commercial: 'Yop',
          },
        },
        ['operator.update'],
      ),
    );
    const { nom_commercial: patchedName } = patchData.result;
    expect(patchStatus).equal(200);
    expect(patchedName).to.eq('Yop');

    const { status: listStatus, data: listData } = await request.post(
      '/',
      callFactory('operator:all', {}, ['operator.list']),
    );
    const list = listData.result;
    expect(listStatus).equal(200);
    expect(list.length).eq(1);
    expect(list[0].nom_commercial).eq(patchedName);

    const { status: deleteStatus, data: deleteData } = await request.post(
      '/',
      callFactory(
        'operator:delete',
        {
          id: _id,
        },
        ['operator.delete'],
      ),
    );
    expect(deleteStatus).equal(200);
    expect(deleteData.result).equal(true);
  });
});
