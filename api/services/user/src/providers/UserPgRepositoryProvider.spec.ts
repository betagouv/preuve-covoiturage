import { PostgresConnection } from '@ilos/connection-postgres';
// import { describe } from 'mocha';
import { expect } from 'chai';

import { UserPgRepositoryProvider } from './UserPgRepositoryProvider';

describe('User pg repository', () => {
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

    repository = new UserPgRepositoryProvider(connection);
  });

  after(async () => {
    if (id) {
      await connection.getClient().query({
        text: `DELETE FROM ${repository.table} WHERE _id = $1`,
        values: [id],
      });
    }

    await connection.down();
  });

  it('should create an user', async () => {
    const data = {
      nom_commercial: 'Toto',
      raison_sociale: 'Toto inc.',
      siret: '1234567890123',
      company: {},
      address: {},
      bank: {},
      contacts: {},
    };

    const result = await repository.create(data);
    id = result._id;
    expect(result.nom_commercial).to.eq(data.nom_commercial);
  });

  it('should update an user', async () => {
    const data = {
      nom_commercial: 'Tata',
    };

    const result = await repository.patch(id, data);
    id = result._id;
    expect(result.nom_commercial).to.eq(data.nom_commercial);
  });

  it('should list users', async () => {
    const result = await repository.all();
    expect(result).to.be.an('array');
    expect(result.length).to.eq(1);
    expect(result[0]._id).to.eq(id);
  });

  it('should find user by id', async () => {
    const result = await repository.find(id);
    expect(result._id).to.eq(id);
  });

  it('should delete user by id', async () => {
    await repository.delete(id);
    const result = await connection.getClient().query({
      text: 'SELECT * FROM operator.operators WHERE _id = $1 LIMIT 1',
      values: [id],
    });
    expect(result.rows[0]._id).to.eq(id);
    expect(result.rows[0].deleted_at).to.be.a('date');

    const resultFromRepository = await repository.find(id);
    expect(resultFromRepository).to.eq(undefined);
  });
});
