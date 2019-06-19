import { expect } from 'chai';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { MongoProvider } from '@ilos/provider-mongo';

import { JourneyRepositoryProvider } from './JourneyRepositoryProvider';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Journey } from '../entities/Journey';

class FakeConfigProvider extends ConfigProviderInterfaceResolver {
  protected conf = {};
  get(key: string, fb?: string): any {
    return key in this.conf ? this.conf[key] : fb;
  }

  set(key: string, value: any): void {
    this.conf[key] = value;
  }
}

const config = new FakeConfigProvider();
let mongoServer;
let mongoClient;
let repository;

const identity = {
  phone: '',
};
const position = {
  datetime: '2019-05-01',
  literal: 'Paris',
};
const operator = {
  _id: '123456',
  name: 'Maxicovoit',
};
const journey1 = {
  operator,
  journeyId: '1',
  operatorJourneyId: '1',
  operatorClass: 'A',
  passenger: {
    identity,
    start: position,
    end: position,
    seats: 1,
    contribution: 1,
    distance: 10,
    duration: 10,
    cost: 0,
    incentive: 0,
    remainingFee: 0,
  },
  driver: {
    identity,
    start: position,
    end: position,
    revenue: 1,
    expense: 1,
    distance: 10,
    duration: 10,
    cost: 0,
    incentive: 0,
    remainingFee: 0,
  },
};

const journey2 = {
  operator,
  journeyId: '2',
  operatorJourneyId: '2',
  operatorClass: 'B',
  passenger: {
    identity,
    start: position,
    end: position,
    seats: 1,
    contribution: 1,
    distance: 10,
    duration: 10,
    cost: 0,
    incentive: 0,
    remainingFee: 0,
  },
  driver: {
    identity,
    start: position,
    end: position,
    revenue: 1,
    expense: 1,
    distance: 10,
    duration: 10,
    cost: 0,
    incentive: 0,
    remainingFee: 0,
  },
};

describe('Journey repository', () => {
  before(async () => {
    mongoServer = new MongoMemoryServer();
    const connectionString = await mongoServer.getConnectionString();
    const dbName = await mongoServer.getDbName();
    config.set('mongo.url', connectionString);
    config.set('aquisition.db', dbName);
    mongoClient = new MongoProvider(config);
    await mongoClient.boot();
    repository = new JourneyRepositoryProvider(config, mongoClient);
  });

  after(async () => {
    await mongoClient.close();
    await mongoServer.stop();
  });

  it('works', async () => {
    const result = await repository.createMany([new Journey(journey1), new Journey(journey2)]);
    expect(result).to.be.a('array');
    expect(result.length).to.eq(2);
    expect(
      result.map((r) => {
        const { _id, ...j } = r;
        return j;
      }),
    ).to.deep.members([journey1, journey2]);
  });
});
