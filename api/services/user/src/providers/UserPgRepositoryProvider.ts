import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TerritoryInterface } from '../shared/territory/common/interfaces/TerritoryInterface';

import {
  UserRepositoryProviderInterface,
  UserRepositoryProviderInterfaceResolver,
} from '../interfaces/UserRepositoryProviderInterface';

import { UserDbInterface, UserCreateInterface, UserPatchInterface } from '../interfaces/UserInterface';
import { PaginationSkipParamsInterface } from '../shared/common/interfaces/PaginationSkipParamsInterface';

@provider({
  identifier: UserRepositoryProviderInterfaceResolver,
})
export class UserPgRepositoryProvider implements UserRepositoryProviderInterface {
  public readonly table = 'auth.users';

  constructor(protected connection: PostgresConnection) {}

  async create(data: UserCreateInterface): Promise<UserDbInterface> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          email,
          firstname,
          lastname,
          roles,
          password,
          phone,
          operator_id,
          territory_id
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8
        )
        RETURNING *
      `,
      values: [
        data.email,
        data.firstname,
        data.lastname,
        data.roles,
        data.password,
        data.phone,
        data.operator_id,
        data.territory_id,
      ],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      const { password, ...exposableData } = data;
      throw new Error(`Unable to create user (${JSON.stringify(exposableData)})`);
    }
    return result.rows[0];
  }

  protected async updateWhere(
    data: UserDbInterface,
    where?: { operator_id?: string; territory_id?: string },
  ): Promise<UserDbInterface> {
    const {
      email,
      firstname,
      lastname,
      roles,
      password,
      phone,
      operator_id,
      territory_id,
      status,
      forgotten_token,
      forgotten_at,
      ui_status,
      _id,
    } = data;

    const query = {
      text: `
      UPDATE ${this.table}
        SET updated_at = NOW()
        email = $1,
        firstname = $2,
        lastname = $3,
        roles = $4,
        password = $5,
        phone = $6,
        operator_id = $7,
        territory_id = $8,
        status = $9,
        forgotten_token = $10,
        forgotten_at = $11,
        ui_status = $12
        WHERE _id = $13
        AND deleted_at is NULL
        ${where ? (where.operator_id ? 'AND operator_id = $14' : 'AND territory_id = $14') : ''}
        RETURNING *
      `,
      values: [
        email,
        firstname,
        lastname,
        roles,
        password,
        phone,
        operator_id,
        territory_id,
        status,
        forgotten_token,
        forgotten_at,
        ui_status,
        _id,
      ],
    };

    if (where) {
      query.values.push(where.operator_id ? where.operator_id : where.territory_id);
    }

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error(`Unable to update user ${data._id}`);
    }

    return result.rows[0];
  }

  async update(data: UserDbInterface): Promise<UserDbInterface> {
    return this.updateWhere(data);
  }

  async updateByOperator(data: UserDbInterface, operator_id: string): Promise<UserDbInterface> {
    return this.updateWhere(data, { operator_id });
  }

  async updateByTerritory(data: UserDbInterface, territory_id: string): Promise<UserDbInterface> {
    return this.updateWhere(data, { territory_id });
  }

  protected async deleteWhere(id: string, where?: { operator_id?: string; territory_id?: string }): Promise<void> {
    const query = {
      text: `
      UPDATE ${this.table}
        SET deleted_at = NOW()
        WHERE _id = $1
        AND deleted_at is NULL
        ${where ? (where.operator_id ? 'AND operator_id = $2' : 'AND territory_id = $2') : ''}
      `,
      values: [id],
    };

    if (where) {
      query.values.push(where.operator_id ? where.operator_id : where.territory_id);
    }

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new NotFoundException(`user not found (${id})`);
    }

    return;
  }

  async delete(id: string): Promise<void> {
    return this.deleteWhere(id);
  }

  async deleteByOperator(id: string, operator_id: string): Promise<void> {
    return this.deleteWhere(id, { operator_id });
  }

  async deleteByTerritory(id: string, territory_id: string): Promise<void> {
    return this.deleteWhere(id, { territory_id });
  }

  async list(
    filters: { territory?: string; operator?: string },
    pagination: PaginationSkipParamsInterface,
  ): Promise<{ users: UserDbInterface[]; total: number }> {
    throw new Error();
  }

  protected buildWhereClauses(
    filters: any,
  ): {
    text: string;
    values: any[];
  } {
    const filtersToProcess = ['_id', 'operator_id', 'territory_id', 'email'].filter((key) => key in filters);

    if (filtersToProcess.length === 0) {
      return;
    }

    const orderedFilters = filtersToProcess
      .map((key) => ({ key, value: filters[key] }))
      .map((filter) => {
        return {
          text: `${filter.key} = $#`,
          values: [filter.value],
        };
      })
      .reduce(
        (acc, current) => {
          acc.text.push(current.text);
          acc.values.push(...current.values);
          return acc;
        },
        {
          text: [],
          values: [],
        },
      );

    const whereClauses = `WHERE ${orderedFilters.text.join(' AND ')}`;
    const whereClausesValues = orderedFilters.values;

    return {
      text: whereClauses,
      values: whereClausesValues,
    };
  }

  protected async findWhere(where: {
    _id?: string;
    operator_id?: string;
    territory_id?: string;
    email?: string;
  }): Promise<UserDbInterface> {
    const whereClauses = this.buildWhereClauses(where);

    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE ${whereClauses.text}
        AND deleted_at IS NULL
        LIMIT 1
      `,
      values: whereClauses.values,
    };

    query.text = query.text.split('$#').reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }

      return `${acc}${current}$${idx + 1}`;
    }, '');

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return undefined;
    }

    return result.rows[0];
  }

  async find(_id: string): Promise<UserDbInterface> {
    return this.findWhere({ _id });
  }

  async findByOperator(_id: string, operator_id: string): Promise<UserDbInterface> {
    return this.findWhere({ _id, operator_id });
  }

  async findByTerritory(_id: string, territory_id: string): Promise<UserDbInterface> {
    return this.findWhere({ _id, territory_id });
  }

  async findByEmail(email: string): Promise<UserDbInterface> {
    return this.findWhere({ email });
  }

  async all(): Promise<TerritoryInterface[]> {
    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE deleted_at IS NULL
      `,
      values: [],
    };

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }

  protected buildSetClauses(
    sets: any,
  ): {
    text: string;
    values: any[];
  } {
    const setToProcess = [
      'operator_id',
      'territory_id',
      'email',
      'firstname',
      'lastname',
      'roles',
      'password',
      'phone',
      'operator_id',
      'territory_id',
      'status',
      'forgotten_token',
      'forgotten_at',
      'ui_status',
    ].filter((key) => key in sets);

    if (setToProcess.length === 0) {
      throw new Error('Please add something to modify :)');
    }

    const finalSets = setToProcess
      .map((key) => ({ key, value: sets[key] }))
      .map((filter) => {
        return {
          text: `${filter.key} = $#`,
          values: [filter.value],
        };
      })
      .reduce(
        (acc, current) => {
          acc.text.push(current.text);
          acc.values.push(...current.values);
          return acc;
        },
        {
          text: [],
          values: [],
        },
      );

    return {
      text: finalSets.text.join(', '),
      values: finalSets.values,
    };
  }

  async patch(_id: string, data: UserPatchInterface): Promise<UserDbInterface> {
    const setClauses = this.buildSetClauses(data);

    const query = {
      text: `
      UPDATE ${this.table}
        SET updated_at = NOW()
        ${setClauses.text}
        WHERE _id = $#
        AND deleted_at is NULL
        RETURNING *
      `,
      values: [...setClauses.values, _id],
    };

    query.text = query.text.split('$#').reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }
      return `${acc}${current}$${idx + 1}`;
    }, '');

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error(`Unable to patch user ${_id}`);
    }

    return result.rows[0];
  }
}
