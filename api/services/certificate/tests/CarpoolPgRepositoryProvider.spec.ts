import { describe } from 'mocha';
import { expect } from 'chai';
import { PostgresConnection } from '@ilos/connection-postgres';

import { CarpoolPgRepositoryProvider } from '../src/providers/CarpoolPgRepositoryProvider';

describe('Carpool pg repository', () => {
  let repository: CarpoolPgRepositoryProvider;
  let connection: PostgresConnection;

  before(async () => {
    connection = new PostgresConnection({
      connectionString:
        'APP_POSTGRES_URL' in process.env
          ? process.env.APP_POSTGRES_URL
          : 'postgresql://postgres:postgres@localhost:5432/local',
    });

    await connection.up();

    repository = new CarpoolPgRepositoryProvider(connection);
  });

  after(async () => {
    await connection.down();
  });

  it('find by phone number - all times', async () => {
    const result = await repository.find({
      identity: '+33619660000',
    });

    console.log(result);
    expect(result).to.be.an('array');
    expect(result.length).to.be.gt(0);
  });

  it('find by phone number - start date', async () => {
    const result = await repository.find({
      identity: '+33619660000',
      start_at: new Date('2019-11-01T00:00:00+0100'),
    });

    console.log(result);
    expect(result).to.be.an('array');
    expect(result.length).to.be.gt(0);
  });

  it('find by phone number - end date', async () => {
    const result = await repository.find({
      identity: '+33619660000',
      end_at: new Date('2019-12-01T00:00:00+0100'),
    });

    console.log(result);
    expect(result).to.be.an('array');
    expect(result.length).to.be.gt(0);
  });

  it('find by phone number - start date and end date', async () => {
    const result = await repository.find({
      identity: '+33619660000',
      start_at: new Date('2019-12-01T00:00:00+0100'),
      end_at: new Date('2019-12-31T23:59:59+0100'),
    });

    console.log(result);
    expect(result).to.be.an('array');
    expect(result.length).to.be.eq(1);
  });
});
