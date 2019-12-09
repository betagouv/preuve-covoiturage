import { describe } from 'mocha';
import { expect } from 'chai';
import { ConfigInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { UserPgRepositoryProvider } from '../src/providers/UserPgRepositoryProvider';
import { UserBaseInterface } from '../src/shared/user/common/interfaces/UserBaseInterface';

class Config extends ConfigInterfaceResolver {
  get(_k: string, fb: string) {
    return fb;
  }
}

const list = [
  'group',
  '_id',
  'status',
  'created_at',
  'updated_at',
  'email',
  'firstname',
  'lastname',
  'role',
  'phone',
  'operator_id',
  'territory_id',
];

const find = ['ui_status', 'permissions', ...list];

const territoryInput: UserBaseInterface = {
  email: 'territory@toto.com',
  firstname: 'toto',
  lastname: 'tata',
  role: 'territory.admin',
  phone: '0102030405',
  // operator_id: 1,
  territory_id: 1,
};

const operatorInput: UserBaseInterface = {
  email: 'operator@toto.com',
  firstname: 'toto',
  lastname: 'tata',
  role: 'operator.admin',
  phone: '0102030405',
  operator_id: 1,
  // territory_id: 1,
};

const registryInput: UserBaseInterface = {
  email: 'registry@toto.com',
  firstname: 'toto',
  lastname: 'tata',
  role: 'registry.admin',
  phone: '0102030405',
  // operator_id: 1,
  // territory_id: 1,
};

describe('User pg repository', async () => {
  let repository;
  let connection;
  const id: { [k: string]: string } = {
    territory: null,
    operator: null,
    registry: null,
  };

  before(async () => {
    connection = new PostgresConnection({
      connectionString:
        'APP_POSTGRES_URL' in process.env
          ? process.env.APP_POSTGRES_URL
          : 'postgresql://postgres:postgres@localhost:5432/pdc-local',
    });

    await connection.up();

    repository = new UserPgRepositoryProvider(connection, new Config());
  });

  after(async () => {
    const ids = Object.values(id);
    for (const uid of ids) {
      if (uid) {
        await connection.getClient().query({
          text: `DELETE FROM ${repository.table} WHERE _id = $1`,
          values: [uid],
        });
      }
    }

    await connection.down();
  });

  it('should create a user', async () => {
    const territoryData = await repository.create(territoryInput);
    id.territory = territoryData._id;
    expect(territoryData.email).to.eq(territoryInput.email);
    expect(territoryData).to.have.all.keys(find);

    const operatorData = await repository.create(operatorInput);
    id.operator = operatorData._id;
    expect(operatorData.email).to.eq(operatorInput.email);
    expect(operatorData).to.have.all.keys(find);

    const registryData = await repository.create(registryInput);
    id.registry = registryData._id;
    expect(registryData.email).to.eq(registryInput.email);
    expect(registryData).to.have.all.keys(find);
  });

  it('should patch a user', async () => {
    const data = {
      phone: '0203040506',
    };
    const result = await repository.patch(id.operator, data);
    expect(result.phone).to.eq(data.phone);
    expect(result).to.have.all.keys(find);
  });

  it('should patch the user if group matches', async () => {
    const data = {
      phone: '0304050607',
    };

    const result = await repository.patchByTerritory(id.territory, data, 1);
    expect(result.phone).to.eq(data.phone);
    expect(result).to.have.all.keys(find);
  });

  it('should not patch the user if group does not match', async () => {
    const data = {
      phone: '0203040506',
    };

    const result = await repository.patchByOperator(id.operator, data, 111);
    expect(result).to.eq(undefined);
  });

  it('should list users', async () => {
    const result = await repository.list({ limit: 1000 });
    expect(result).to.have.property('users');
    expect(result.users).to.be.an('array');

    // weird behaviour. Not all users are listed by the .list() command
    const insertedUsers = result.users.filter((u) => /@toto.com$/.test(u.email));
    for (const r of insertedUsers) {
      expect(r).to.have.all.keys(list);
    }
  });

  it('should list users with pagination', async () => {
    const result = await repository.list({}, { limit: 1, offset: 1 });
    expect(result).to.have.property('users');
    expect(result.users).to.be.an('array');
    expect(result.users.length).to.eq(1);
    for (const r of result.users) {
      expect(r).to.have.all.keys(list);
    }
  });

  it('should list users with filters', async () => {
    const result = await repository.list({ operator_id: 1 });
    expect(result).to.have.property('total', 1);
    expect(result).to.have.property('users');
    expect(result.users).to.be.an('array');
    expect(result.users.length).to.eq(1);
    for (const r of result.users) {
      expect(r).to.have.all.keys(list);
    }
  });

  it('should find user by id', async () => {
    const result = await repository.find(id.registry);
    expect(result._id).to.eq(id.registry);
    expect(result).to.have.all.keys(find);
  });

  it('should find user by id if group match', async () => {
    const result = await repository.findByOperator(id.operator, 1);
    expect(result._id).to.eq(id.operator);
    expect(result).to.have.all.keys(find);
  });

  it('should not find user by id if group dont match', async () => {
    const result = await repository.findByTerritory(id.territory, 111);
    expect(result).to.be.eq(undefined);
  });

  it('should delete user by id', async () => {
    await repository.delete(id.registry);
    const result = await connection.getClient().query({
      text: `SELECT * FROM ${repository.table} WHERE _id = $1 LIMIT 1`,
      values: [id.registry],
    });
    expect(result.rows[0]._id).to.eq(id.registry);
    expect(result.rows[0].deleted_at).to.be.a('date');

    const resultFromRepository = await repository.find(id.registry);
    expect(resultFromRepository).to.eq(undefined);
  });

  it('should delete user by id if group match', async () => {
    await repository.deleteByTerritory(id.territory, 1);
    const result = await connection.getClient().query({
      text: `SELECT * FROM ${repository.table} WHERE _id = $1 LIMIT 1`,
      values: [id.territory],
    });
    expect(result.rows[0]._id).to.eq(id.territory);
    expect(result.rows[0].deleted_at).to.be.a('date');

    const resultFromRepository = await repository.find(id.territory);
    expect(resultFromRepository).to.eq(undefined);
  });

  it('should not delete user by id if group dont match', async () => {
    await repository.deleteByOperator(id.operator, 111);
    const result = await connection.getClient().query({
      text: `SELECT * FROM ${repository.table} WHERE _id = $1 LIMIT 1`,
      values: [id.operator],
    });
    expect(result.rows[0]._id).to.eq(id.operator);
    expect(result.rows[0].deleted_at).to.eq(null);

    const resultFromRepository = await repository.find(id.operator);
    expect(resultFromRepository).not.to.eq(undefined);
  });
});
