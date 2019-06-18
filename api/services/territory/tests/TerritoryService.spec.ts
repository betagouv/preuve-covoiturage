// tslint:disable max-classes-per-file
import { MongoMemoryServer } from 'mongodb-memory-server';
import axios from 'axios';
import chai from 'chai';
import chaiNock from 'chai-nock';
import { bootstrap } from '@ilos/framework';
import { MongoProvider } from '@ilos/provider-mongo';

let mongoServer;
let connectionString;
let dbName;
let kernel;
let transport;
let request;

chai.use(chaiNock);

const { expect } = chai;
const port = '8081';

describe('Territory service', () => {
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

  it('should work', async () => {
    const { status: createStatus, data: createData } = await request.post('/', {
      id: 1,
      jsonrpc: '2.0',
      method: 'territory:create',
      params: {
        name: 'Toto',
      },
    });
    const { _id, name } = createData.result;
    expect(name).to.eq('Toto');
    expect(createStatus).equal(200);

    const { status: patchStatus, data: patchData } = await request.post('/', {
      id: 1,
      jsonrpc: '2.0',
      method: 'territory:patch',
      params: {
        id: _id,
        patch: {
          name: 'Yop',
        },
      },
    });
    const { name: patchedName } = patchData.result;
    expect(patchedName).to.eq('Yop');
    expect(patchStatus).equal(200);

    const { status: listStatus, data: listData } = await request.post('/', {
      id: 1,
      jsonrpc: '2.0',
      method: 'territory:all',
    });
    const list = listData.result;
    expect(list.length).eq(1);
    expect(list[0].name).eq(patchedName);
    expect(listStatus).equal(200);

    const { status: deleteStatus, data: deleteData } = await request.post('/', {
      id: 1,
      jsonrpc: '2.0',
      method: 'territory:delete',
      params: {
        _id,
      },
    });
    expect(deleteStatus).equal(200);
    expect(deleteData.result).equal(true);
  });
});
