import { describe } from 'mocha';
import { expect } from 'chai';
import { PostgresConnection } from '@ilos/connection-postgres';
import { IdentityRepositoryProvider } from '../src/providers/IdentityRepositoryProvider';

describe('IdentityRepositoryProvider', () => {
  let connection: PostgresConnection;
  let repository: IdentityRepositoryProvider;
  let id: number;
  before(async () => {
    connection = new PostgresConnection({
      connectionString: process.env.APP_POSTGRES_URL,
    });
    await connection.up();
    repository = new IdentityRepositoryProvider(connection);
  });

  after(async () => {
    if (id) {
      await connection.getClient().query({
        text: `
          DELETE from ${repository.table} WHERE _id = $1
        `,
        values: [id],
      });
    }
    await connection.down();
  });

  it('should save identity', async () => {
    const { _id } = await repository.create({});
    id = _id;
    expect(_id).to.be.a('number');
    const r = await connection.getClient().query({
      text: `SELECT * from ${repository.table} WHERE _id = $1`,
      values: [id],
    });
    expect(r.rowCount).to.be.eq(1);
  });

  it('should delete identity', async () => {
    await repository.delete(id);
    const r = await connection.getClient().query({
      text: `SELECT * from ${repository.table} WHERE _id = $1`,
      values: [id],
    });
    expect(r.rowCount).to.be.eq(0);
  });
});
