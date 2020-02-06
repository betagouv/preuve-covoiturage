/**
 * Use the seed command to fill the database with fake data before running the tests\
 *
 * $ yarn workspace @pdc/service-certificate ilos seed -d '+33619660000'
 */

import { describe } from 'mocha';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { CarpoolPgRepositoryProvider } from '../src/providers/CarpoolPgRepositoryProvider';

chai.use(chaiAsPromised);
const { expect } = chai;

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

  it('find by phone number', async () => {
    const result = await repository.find({
      identity: '+33619660000',
      start_at: new Date('2019-01-01'),
      end_at: new Date(),
    });

    // console.log(result);
    expect(result).to.be.an('array');
    expect(result.length).to.be.gt(0);
  });

  it('fails with missing identity', async () => {
    const identity = '+33600000000';
    const result = repository.find({
      identity,
      start_at: new Date('2019-01-01'),
      end_at: new Date(),
    });

    // console.log(result);
    await expect(result).to.be.rejectedWith(NotFoundException);
  });
});
