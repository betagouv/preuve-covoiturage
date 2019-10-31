import { describe } from 'mocha';
import { expect } from 'chai';
import { PostgresConnection } from '@ilos/connection-postgres';

import { ApplicationPgRepositoryProvider } from './ApplicationPgRepositoryProvider';

describe('Application pg repository', () => {
  let repository;
  let connection;
  let id;

  before(async () => {
    connection = new PostgresConnection({
      connectionString:
        'APP_POSTGRES_URL' in process.env
          ? process.env.APP_POSTGRES_URL
          : 'postgresql://postgres:postgres@localhost:5432/pdc-local',
    });

    await connection.up();

    repository = new ApplicationPgRepositoryProvider(connection);
  });

  after(async () => {
    if (id) {
      await connection.getClient().query({
        text: 'DELETE FROM application.applications WHERE _id = $1',
        values: [id],
      });
    }

    await connection.down();
  });

  it('should create an application', async () => {
    const result = await repository.createForOperator('Dummy Application', '12345');
    id = result._id;
    expect(result.nom_commercial).to.eq('Dummy Application');
  });

  it("should list operator's applications", async () => {
    const result = await repository.allByOperator('12345');
    expect(result).to.be.an('array');
    expect(result.length).to.eq(1);
    expect(result[0]._id).to.eq(id);
  });

  it('should delete application by id', async () => {
    await repository.delete(id);
    const result = await connection.getClient().query({
      text: 'SELECT * FROM application.applications WHERE _id = $1 LIMIT 1',
      values: [id],
    });
    expect(result.rows[0]._id).to.eq(id);
    expect(result.rows[0].deleted_at).to.be.a('date');

    const resultFromRepository = await repository.find(id);
    expect(resultFromRepository).to.eq(undefined);
  });
});
