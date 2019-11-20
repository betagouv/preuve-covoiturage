import { describe } from 'mocha';
import { expect } from 'chai';
import { PostgresConnection } from '@ilos/connection-postgres';

import { JourneyPgRepositoryProvider } from './JourneyPgRepositoryProvider';
import { AcquisitionInterface } from '../shared/acquisition/common/interfaces/AcquisitionInterface';

const journey1: AcquisitionInterface = {
  _id: 1,
  operator_id: 1,
  journey_id: '2acb88e4-3fe2-4b6b-80b9-5b20526179f1',
  application_id: '9e84bb6f-ac90-48e2-8da0-e23c5ed828b3',
  created_at: new Date(),
  payload: {
    journey_id: '2acb88e4-3fe2-4b6b-80b9-5b20526179f1',
    operator_journey_id: '438068ff-5661-4ff3-b40a-91816326c4ff',
    operator_class: 'A',
    operator_id: 1,
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
  },
};

const journey2: AcquisitionInterface = {
  _id: 2,
  operator_id: 1,
  journey_id: '2260624c-f3f5-4d28-8c50-97c672eec1ae',
  application_id: 'c24d6d69-b82f-4373-a161-b49512cd94bd',
  created_at: new Date(),
  payload: {
    journey_id: '2260624c-f3f5-4d28-8c50-97c672eec1ae',
    operator_journey_id: 'cc7c351a-4ebe-49a2-93a1-66cde30245ae',
    operator_class: 'B',
    operator_id: 1,
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
  },
};

describe('Journey pg repository', () => {
  let pgClient;
  let repository;
  const ids = [];

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
    // insert 2 journeys at once
    const result = await repository.createMany([journey1.payload, journey2.payload], {
      operator_id: journey1.operator_id,
      application_id: journey1.application_id,
    });
    expect(result).to.be.a('array');
    expect(result.length).to.eq(2);

    // store for after()
    result.map((r: AcquisitionInterface) => {
      ids.push(r._id);
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
    ).to.deep.members([journey1.payload, journey2.payload]);
  });
});
