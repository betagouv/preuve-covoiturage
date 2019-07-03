import chai from 'chai';
import supertest from 'supertest';
import chaiAsPromised from 'chai-as-promised';

import { FakeServer } from './server/server';
import { MockFactory } from './mocks/factory';
import { journey } from './mocks/journey';

chai.use(chaiAsPromised);

const { expect } = chai;

const mockServer = new FakeServer();
const mockFactory = new MockFactory();

let superRequest;

before(async () => {
  await mockServer.startServer();
  await mockServer.startTransport();
  superRequest = supertest(mockServer.server);
});

after(async () => {
  await mockServer.stopServer();
  await mockServer.stopTransport();
});

const request = mockFactory.request();

const existingTripId = '5d0b616f9f611aef34deb304';
let processParams;

describe('SERVICE CROSSCHECK : Process', () => {
  before(async () => {
    processParams = { ...journey };
    // todo: add trip in database
  });

  it('should create trip', async () => {

    const { status: createStatus, data: createData } = await request.post(
      '/',
      mockFactory.call(
        'user:create',
        {
          ...processParams,
        },
      ),
    );

    expect(createData.result).to.have.property('_id');
    delete createData.result._id;
    expect(createData.result).to.eql({
      // todo: fill this
    });
    expect(createStatus).equal(200);
  });
});
