import { describe } from 'mocha';
import { expect } from 'chai';
import { Kernel as AbstractKernel } from '@ilos/framework';
import { kernel as kernelDecorator } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { ServiceProvider } from '../ServiceProvider';
import { OperatorPgRepositoryProvider } from '../providers/OperatorPgRepositoryProvider';

@kernelDecorator({
  children: [ServiceProvider],
})
class Kernel extends AbstractKernel {}

describe('Operator pg repository', () => {
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

    repository = new OperatorPgRepositoryProvider(connection, new Kernel());
  });

  after(async () => {
    if (id) {
      await connection.getClient().query({
        text: 'DELETE FROM operator.operators WHERE _id = $1',
        values: [id],
      });
    }

    await connection.down();
  });

  it('should create an operator', async () => {
    const data = {
      name: 'Toto',
      legal_name: 'Toto inc.',
      siret: '1234567890123',
      company: {},
      address: {},
      bank: {},
      contacts: {},
    };

    const result = await repository.create(data);
    id = result._id;
    expect(result.name).to.eq(data.name);
  });

  it('should update an operator', async () => {
    const data = {
      name: 'Tata',
    };

    const result = await repository.patch(id, data);
    id = result._id;
    expect(result.name).to.eq(data.name);
  });

  it('should list operators', async () => {
    const result = await repository.all();
    expect(result).to.be.an('array');
    const results = [...result.filter((r) => r._id === id)];
    expect(results.length).to.eq(1);
    expect(results[0]._id).to.eq(id);
  });

  it('should find operator by id', async () => {
    const result = await repository.find(id);
    expect(result._id).to.eq(id);
  });

  it('should delete operator by id', async () => {
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
