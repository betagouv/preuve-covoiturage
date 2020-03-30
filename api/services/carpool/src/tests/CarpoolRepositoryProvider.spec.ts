import { describe } from 'mocha';
import { PostgresConnection } from '@ilos/connection-postgres';
import { CarpoolRepositoryProvider } from '../providers/CarpoolRepositoryProvider';
import { PeopleWithIdInterface } from '../interfaces/Carpool';

describe('CarpoolRepositoryProvider', () => {
  let connection: PostgresConnection;
  let repository: CarpoolRepositoryProvider;
  const acquisition_id = 0;
  before(async () => {
    connection = new PostgresConnection({
      connectionString: process.env.APP_POSTGRES_URL,
    });
    await connection.up();
    repository = new CarpoolRepositoryProvider(connection);
  });

  after(async () => {
    if (acquisition_id) {
      await connection.getClient().query({
        text: `
          DELETE from ${repository.table} WHERE acquisition_id = $1
        `,
        values: [acquisition_id],
      });
    }
    await connection.down();
  });

  it('should save new carpool', async () => {
    const data: {
      acquisition_id: number;
      operator_id: number;
      operator_journey_id: string;
      operator_trip_id: string;
      created_at: Date;
      operator_class: string;
      trip_id: string;
    } = {
      acquisition_id,
      operator_id: 0,
      operator_journey_id: 'myid',
      operator_trip_id: 'myopid',
      created_at: new Date(),
      operator_class: 'A',
      trip_id: '973b462f-6521-4b57-85c8-970c2d34fb10',
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
    await repository.importFromAcquisition(data, people);
  });
});
