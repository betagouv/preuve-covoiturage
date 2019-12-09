import { describe } from 'mocha';
import { expect } from 'chai';
import { PostgresConnection } from '@ilos/connection-postgres';

import { CrosscheckRepositoryProvider } from '../src/providers/CrosscheckRepositoryProvider';

describe('CrosscheckRepositoryProvider', () => {
  let connection: PostgresConnection;
  let repository: CrosscheckRepositoryProvider;

  before(async () => {
    connection = new PostgresConnection({
      connectionString: process.env.APP_POSTGRES_URL,
    });
    await connection.up();
    repository = new CrosscheckRepositoryProvider(connection);
  });

  after(async () => {
    await connection.down();
  });

  it('should get a new uuid', async () => {
    const data = {
      operator_trip_id: '0',
      datetime: new Date(),
      start: {
        lat: 0,
        lon: 0,
        insee: 'myinsee',
      },
      end: {
        lat: 0,
        lon: 0,
        insee: 'myinsee',
      },
      identity_uuid: '973b462f-6521-4b57-85c8-970c2d34fb10',
    };
    const uuid = await repository.getTripId(data);
    expect(uuid).to.be.a('string');

    const uuid2 = await repository.getTripId(data);
    expect(uuid2).to.be.a('string');

    expect(uuid).not.to.be.eq(uuid2);
  });
});
