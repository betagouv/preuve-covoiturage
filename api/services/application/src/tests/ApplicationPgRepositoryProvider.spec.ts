import { describe } from 'mocha';
import { expect } from 'chai';
import { PostgresConnection } from '@ilos/connection-postgres';

import { ApplicationPgRepositoryProvider } from '../providers/ApplicationPgRepositoryProvider';

describe('Application pg repository', () => {
  let repository;
  let connection;
  let uuid;

  const sortDesc = (a: number, b: number): number => (a > b ? -1 : 1);

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
    if (uuid) {
      await connection.getClient().query({
        text: 'DELETE FROM application.applications WHERE uuid = $1',
        values: [uuid],
      });
    }

    await connection.down();
  });

  it('should create an application', async () => {
    const result = await repository.create({
      name: 'Dummy Application',
      owner_id: '12345',
      owner_service: 'operator',
      permissions: ['journey.create'],
    });

    uuid = result.uuid;
    expect(result.name).to.eq('Dummy Application');
  });

  it("should list owner's applications", async () => {
    const result = await repository.list({
      owner_id: '12345',
      owner_service: 'operator',
    });

    expect(result).to.be.an('array');
    expect(result.sort(sortDesc)[0].uuid).to.eq(uuid);
  });

  it('should find an application', async () => {
    const result = await repository.find({
      uuid,
      owner_id: '12345',
      owner_service: 'operator',
    });

    expect(result.uuid).to.eq(uuid);
  });

  it('should revoke application by id', async () => {
    await repository.revoke({ uuid, owner_id: '12345', owner_service: 'operator' });
    const result = await connection.getClient().query({
      text: 'SELECT * FROM application.applications WHERE uuid = $1 LIMIT 1',
      values: [uuid],
    });

    const rows = result.rows.sort(sortDesc);
    expect(rows[0].uuid).to.eq(uuid);
    expect(rows[0].deleted_at).to.be.a('date');
  });
});
