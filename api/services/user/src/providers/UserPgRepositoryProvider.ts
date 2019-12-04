import { provider, ConfigInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { UserFindInterface } from '../shared/user/common/interfaces/UserFindInterface';
import { UserListFiltersInterface } from '../shared/user/common/interfaces/UserListFiltersInterface';
import { UserListInterface } from '../shared/user/common/interfaces/UserListInterface';
import { UserPatchInterface } from '../shared/user/common/interfaces/UserPatchInterface';
import {
  UserRepositoryProviderInterface,
  UserRepositoryProviderInterfaceResolver,
} from '../interfaces/UserRepositoryProviderInterface';
import { PaginationParamsInterface } from '../shared/common/interfaces/PaginationParamsInterface';
import { UserCreateInterface } from '../shared/user/common/interfaces/UserCreateInterface';

@provider({
  identifier: UserRepositoryProviderInterfaceResolver,
})
export class UserPgRepositoryProvider implements UserRepositoryProviderInterface {
  public readonly table = 'auth.users';
  public readonly defaultLimit: number;
  public readonly maxLimit: number;

  protected readonly availableFilters = ['_id', 'operator_id', 'territory_id', 'email'];
  protected readonly availableSets = [
    // 'operator_id',
    // 'territory_id',
    'email',
    'firstname',
    'lastname',
    'role',
    // 'password',
    'phone',
    // 'status',
    // 'forgotten_token',
    // 'forgotten_at',
    'ui_status',
  ];
  protected readonly groupCastStatement = `CASE
      WHEN operator_id is not null THEN 'operators'
      WHEN territory_id is not null THEN 'territories'
      ELSE 'registry'
    END as group`;

  protected readonly permissionsJoin = 'JOIN common.roles ON roles.slug = role';

  constructor(protected connection: PostgresConnection, config: ConfigInterfaceResolver) {
    this.defaultLimit = config.get('pagination.defaultLimit', 10);
    this.maxLimit = config.get('pagination.maxLimit', 1000);
  }

  async create(data: UserCreateInterface): Promise<UserFindInterface> {
    // status: 'pending',
    const query = {
      text: `
        WITH data as(
          INSERT INTO ${this.table} (
            email,
            firstname,
            lastname,
            role,
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
            $7
          )
          RETURNING
          _id,
          status,
          created_at,
          updated_at,
          ui_status,
          email,
          firstname,
          lastname,
          role,
          phone,
          operator_id,
          territory_id
        )
      SELECT
        data.*,
        ${this.groupCastStatement},
        roles.permissions
      FROM data
      ${this.permissionsJoin}
      `,
      values: [data.email, data.firstname, data.lastname, data.role, data.phone, data.operator_id, data.territory_id],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create user (${JSON.stringify(data)})`);
    }

    return this.castTypes(result.rows[0]);
  }

  protected async deleteWhere(id: number, where?: { operator_id?: number; territory_id?: number }): Promise<boolean> {
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
      return false;
    }

    return true;
  }

  async delete(id: number): Promise<boolean> {
    return this.deleteWhere(id);
  }

  async deleteByOperator(id: number, operator_id: number): Promise<boolean> {
    return this.deleteWhere(id, { operator_id });
  }

  async deleteByTerritory(id: number, territory_id: number): Promise<boolean> {
    return this.deleteWhere(id, { territory_id });
  }

  async list(
    filters: UserListFiltersInterface,
    pagination: PaginationParamsInterface,
  ): Promise<{ users: UserListInterface[]; total: number }> {
    const whereClauses = this.buildWhereClauses(filters);

    const totalQuery = {
      text: `
        SELECT count(*) as total FROM ${this.table}
        ${whereClauses.text}
        ${whereClauses.text ? 'AND' : 'WHERE'} deleted_at IS NULL
      `,
      values: whereClauses.values,
    };

    totalQuery.text = totalQuery.text.split('$#').reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }

      return `${acc}${current}$${idx + 1}`;
    }, '');

    const totalResult = await this.connection.getClient().query(totalQuery);
    const total = Number(totalResult.rows.length === 1 ? totalResult.rows[0].total : -1);

    let limit: number = (pagination && pagination.limit) || this.defaultLimit;
    const offset: number = (pagination && pagination.offset) || 0;

    if (limit > this.maxLimit) {
      limit = this.maxLimit;
    }

    const query = {
      text: `
        SELECT
          _id,
          status,
          created_at,
          updated_at,
          email,
          firstname,
          lastname,
          role,
          phone,
          operator_id,
          territory_id,
          ${this.groupCastStatement}
        FROM ${this.table}
        ${whereClauses.text}
        ${whereClauses.text ? 'AND' : 'WHERE'} deleted_at IS NULL
        LIMIT ${limit}
        OFFSET ${offset}
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
      return {
        total,
        users: [],
      };
    }

    return {
      total,
      users: result.rows.map(this.castTypes),
    };
  }

  protected buildWhereClauses(
    filters: any,
  ): {
    text: string;
    values: any[];
  } {
    if (!filters || Object.keys(filters).length === 0) {
      return {
        text: '',
        values: [],
      };
    }

    const filtersToProcess = this.availableFilters.filter((key) => key in filters);

    if (filtersToProcess.length === 0) {
      return {
        text: '',
        values: [],
      };
    }

    const orderedFilters = filtersToProcess
      .map((key) => ({ key, value: filters[key] }))
      .map((filter) => ({ text: `${filter.key} = $#`, values: [filter.value] }))
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
    _id?: number;
    operator_id?: number;
    territory_id?: number;
    email?: string;
  }): Promise<UserFindInterface> {
    if (!where || Object.keys(where).length === 0) {
      return undefined;
    }

    const whereClauses = this.buildWhereClauses(where);
    const query = {
      text: `
        SELECT
          _id,
          status,
          created_at,
          updated_at,
          email,
          firstname,
          lastname,
          role,
          phone,
          operator_id,
          territory_id,
          ui_status,
          ${this.groupCastStatement},
          roles.permissions
        FROM ${this.table}
        ${this.permissionsJoin}
        ${whereClauses.text}
        ${whereClauses.text ? 'AND' : 'WHERE'} deleted_at IS NULL
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

    return this.castTypes(result.rows[0]);
  }

  async find(_id: number): Promise<UserFindInterface | undefined> {
    return this.findWhere({ _id });
  }

  async findByOperator(_id: number, operator_id: number): Promise<UserFindInterface | undefined> {
    return this.findWhere({ _id, operator_id });
  }

  async findByTerritory(_id: number, territory_id: number): Promise<UserFindInterface | undefined> {
    return this.findWhere({ _id, territory_id });
  }

  async findByEmail(email: string): Promise<UserFindInterface | undefined> {
    return this.findWhere({ email });
  }

  protected buildSetClauses(
    sets: any,
  ): {
    text: string;
    values: any[];
  } {
    const setToProcess = this.availableSets.filter((key) => key in sets);

    if (setToProcess.length === 0) {
      throw new Error('Please add something to modify :)');
    }

    const finalSets = setToProcess
      .map((key) => ({ key, value: sets[key] }))
      .map((filter) => ({ text: `${filter.key} = $#`, values: [filter.value] }))
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
  protected async patchWhere(
    data: UserPatchInterface,
    where: { _id: number; operator_id?: number; territory_id?: number },
  ): Promise<UserFindInterface> {
    if (!data || !where || Object.keys(data).length === 0 || Object.keys(where).length === 0) {
      return undefined;
    }

    const setClauses = this.buildSetClauses(data);
    const whereClauses = this.buildWhereClauses(where);

    const query = {
      text: `
        WITH data as(
        UPDATE ${this.table}
          SET ${setClauses.text}
          ${whereClauses.text}
          ${whereClauses.text ? 'AND' : 'WHERE'} deleted_at is NULL
        RETURNING
          _id,
          status,
          created_at,
          updated_at,
          ui_status,
          email,
          firstname,
          lastname,
          role,
          phone,
          operator_id,
          territory_id
        )
      SELECT
        data.*,
        ${this.groupCastStatement},
        roles.permissions
      FROM data
      ${this.permissionsJoin}
      `,
      values: [...setClauses.values, ...whereClauses.values],
    };

    query.text = query.text.split('$#').reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }
      return `${acc}${current}$${idx + 1}`;
    }, '');

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      return undefined;
    }

    return this.castTypes(result.rows[0]);
  }

  async patch(_id: number, data: UserPatchInterface): Promise<UserFindInterface> {
    return this.patchWhere(data, { _id });
  }

  async patchByOperator(_id: number, data: UserPatchInterface, operator_id: number): Promise<UserFindInterface> {
    return this.patchWhere(data, { _id, operator_id });
  }

  async patchByTerritory(_id: number, data: UserPatchInterface, territory_id: number): Promise<UserFindInterface> {
    return this.patchWhere(data, { _id, territory_id });
  }

  private castTypes(row: any): any {
    return {
      ...row,
      territory_id: typeof row.territory_id === 'string' ? parseInt(row.territory_id, 10) : row.territory_id,
      operator_id: typeof row.operator_id === 'string' ? parseInt(row.operator_id, 10) : row.operator_id,
    };
  }
}
