// import { describe } from 'mocha';
import { expect } from 'chai';
import { PostgresConnection } from '@ilos/connection-postgres';
import { CreateJourneyParamsInterface } from '@pdc/provider-schema';

import { Journey } from '../entities/Journey';
import { JourneyPgRepositoryProvider } from './JourneyPgRepositoryProvider';

const journey1: CreateJourneyParamsInterface = {
  journey_id: '1',
  operator_journey_id: '1',
  operator_class: 'A',
  operator_id: '5d10c5ec63214bba0f9fa2d4',
  passenger: {
    identity: { phone: '+33612345678' },
    start: { datetime: new Date('2019-05-01T10:00:00Z'), literal: 'Paris' },
    end: { datetime: new Date('2019-05-01T11:00:00Z'), literal: 'Evry' },
    seats: 1,
    expense: 1,
    contribution: 1,
    incentives: [],
    distance: 10,
    duration: 10,
  },
  driver: {
    identity: { phone: '+33687654321' },
    start: { datetime: new Date('2019-05-01T10:00:00Z'), literal: 'Paris' },
    end: { datetime: new Date('2019-05-01T11:00:00Z'), literal: 'Evry' },
    expense: 1,
    revenue: 1,
    incentives: [],
    distance: 10,
    duration: 10,
  },
};

const journey2: CreateJourneyParamsInterface = {
  journey_id: '2',
  operator_journey_id: '2',
  operator_class: 'B',
  operator_id: '5d10c5ec63214bba0f9fa2d4',
  passenger: {
    identity: { phone: '+33687652134' },
    start: { datetime: new Date('2019-05-01T10:00:00Z'), literal: 'Paris' },
    end: { datetime: new Date('2019-05-01T11:00:00Z'), literal: 'Evry' },
    seats: 1,
    expense: 1,
    contribution: 1,
    incentives: [],
    distance: 10,
    duration: 10,
  },
  driver: {
    identity: { phone: '+33687654321' },
    start: { datetime: new Date('2019-05-01T10:00:00Z'), literal: 'Paris' },
    end: { datetime: new Date('2019-05-01T11:00:00Z'), literal: 'Evry' },
    expense: 1,
    revenue: 1,
    incentives: [],
    distance: 10,
    duration: 10,
  },
};

let pgClient;
let repository;
const ids = [];
describe('Journey pg repository', () => {
  before(async () => {
    pgClient = new PostgresConnection({ connectionString: process.env.APP_POSTGRES_URL });
    await pgClient.up();
    repository = new JourneyPgRepositoryProvider(pgClient);
  });

  after(async () => {
    await pgClient.getClient().query({
      text: `DELETE FROM ${repository.table} WHERE _id = ANY($1)`,
      values: [ids],
    });
    await pgClient.down();
  });

  it('works', async () => {
    const result = await repository.createMany([new Journey(journey1), new Journey(journey2)]);
    expect(result).to.be.a('array');
    expect(result.length).to.eq(2);
    result.map((r) => {
      const { _id } = r;
      ids.push(_id);
    });
    const { rows } = await pgClient.getClient().query({
      text: `SELECT payload FROM ${repository.table} WHERE _id = ANY($1)`,
      values: [ids],
    });
    expect(
      rows.map((r) => {
        const ret = r.payload;
        return {
          ...ret,
          driver: {
            ...ret.driver,
            start: {
              ...ret.driver.start,
              datetime: new Date(ret.driver.start.datetime),
            },
            end: {
              ...ret.driver.end,
              datetime: new Date(ret.driver.end.datetime),
            },
          },
          passenger: {
            ...ret.passenger,
            start: {
              ...ret.passenger.start,
              datetime: new Date(ret.passenger.start.datetime),
            },
            end: {
              ...ret.passenger.end,
              datetime: new Date(ret.passenger.end.datetime),
            },
          },
        };
      }),
    ).to.deep.members([journey1, journey2]);
  });
});
