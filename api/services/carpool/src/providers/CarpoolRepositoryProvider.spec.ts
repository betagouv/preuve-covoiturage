import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { CarpoolRepositoryProvider } from './CarpoolRepositoryProvider';
import { PeopleWithIdInterface } from '../interfaces/Carpool';

interface TestContext {
  connection: PostgresConnection;
  repository: CarpoolRepositoryProvider;
}

const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/pdc-local',
  });
  await t.context.connection.up();
  t.context.repository = new CarpoolRepositoryProvider(t.context.connection);
});

test.after.always(async (t) => {
  await t.context.connection.getClient().query({
    text: `DELETE FROM ${t.context.repository.table} WHERE acquisition_id = $1`,
    values: [0],
  });
  await t.context.connection.down();
});

test.serial('Should create carpool', async (t) => {
  const data: {
    acquisition_id: number;
    operator_id: number;
    operator_journey_id: string;
    operator_trip_id: string;
    created_at: Date;
    operator_class: string;
    trip_id: string;
    status: string;
  } = {
    acquisition_id: 0,
    operator_id: 0,
    operator_journey_id: 'myid',
    operator_trip_id: 'myopid',
    created_at: new Date(),
    operator_class: 'A',
    trip_id: '973b462f-6521-4b57-85c8-970c2d34fb10',
    status: 'ok',
  };

  const people: PeopleWithIdInterface[] = [
    {
      identity_id: 0,
      // operator_trip_id: 0,
      is_driver: true,
      datetime: new Date(),
      start: {
        lat: 0,
        lon: 0,
        insee: '',
      },
      end: {
        lat: 0,
        lon: 0,
        insee: '',
      },
      seats: 0,
      duration: 0,
      distance: 0,
      cost: 0,
      meta: {
        calc_distance: 0,
        calc_duration: 0,
        payments: [],
      },
    },
    {
      identity_id: 0,
      // operator_trip_id: 0,
      is_driver: false,
      datetime: new Date(),
      start: {
        lat: 0,
        lon: 0,
        insee: '',
      },
      end: {
        lat: 0,
        lon: 0,
        insee: '',
      },
      seats: 0,
      duration: 0,
      distance: 0,
      cost: 0,
      meta: {
        calc_distance: 0,
        calc_duration: 0,
        payments: [],
      },
    },
  ];
  await t.context.repository.importFromAcquisition(data, people);

  const result = await t.context.connection.getClient().query({
    text: `SELECT * from ${t.context.repository.table} WHERE acquisition_id = $1`,
    values: [0],
  });
  t.is(result.rowCount, 2);
  t.deepEqual(
    result.rows.map((r) => r.operator_journey_id),
    [data.operator_journey_id, data.operator_journey_id],
  );
});
