import { describe } from 'mocha';
import { expect } from 'chai';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { MongoProvider } from '@ilos/provider-mongo';

import { JourneyRepositoryProvider } from './JourneyRepositoryProvider';
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

let mongoClient;
let repository;

const identity = {
  phone: '',
};
const position = {
  datetime: '2019-05-01T10:00:00Z',
  literal: 'Paris',
};
const operator = {
  _id: '5d10c5ec63214bba0f9fa2d4',
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

const config = new FakeConfigProvider();

describe('Journey repository', () => {
  before(async () => {
    process.env.APP_MONGO_DB = 'pdc-test-' + new Date().getTime();

    config.set('mongo.url', process.env.APP_MONGO_URL);
    config.set('mongo.db', process.env.APP_MONGO_DB);
    config.set('acquisition.db', process.env.APP_MONGO_DB);

    mongoClient = new MongoProvider(config);
    await mongoClient.boot();
    repository = new JourneyRepositoryProvider(config, mongoClient);
  });

  after(async () => {
    await mongoClient.getDb(process.env.APP_MONGO_DB).then((db) => db.dropDatabase());
    await mongoClient.close();
    process.exit(0);
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
