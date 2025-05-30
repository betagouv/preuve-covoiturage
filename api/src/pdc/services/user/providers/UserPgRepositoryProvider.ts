import { ConfigInterfaceResolver, ConflictException, NotFoundException, provider } from "@/ilos/common/index.ts";
import { LegacyPostgresConnection } from "@/ilos/connection-postgres/index.ts";

import { get } from "@/lib/object/index.ts";
import { PaginationParamsInterface } from "@/shared/common/interfaces/PaginationParamsInterface.ts";
import { UserCreateInterface } from "../contracts/common/interfaces/UserCreateInterface.ts";
import { UserFindInterface } from "../contracts/common/interfaces/UserFindInterface.ts";
import { UserLastLoginInterface } from "../contracts/common/interfaces/UserLastLoginInterface.ts";
import { UserListFiltersInterface } from "../contracts/common/interfaces/UserListFiltersInterface.ts";
import { UserListInterface } from "../contracts/common/interfaces/UserListInterface.ts";
import { UserPatchInterface } from "../contracts/common/interfaces/UserPatchInterface.ts";
import { ResultInterface as HasUsersResultInterface } from "../contracts/hasUsers.contract.ts";
import {
  UserRepositoryProviderInterface,
  UserRepositoryProviderInterfaceResolver,
} from "../interfaces/UserRepositoryProviderInterface.ts";

@provider({
  identifier: UserRepositoryProviderInterfaceResolver,
})
export class UserPgRepositoryProvider implements UserRepositoryProviderInterface {
  public readonly table = "auth.users";
  public readonly defaultLimit: number;
  public readonly maxLimit: number;

  protected readonly availableFilters = [
    "_id",
    "operator_id",
    "territory_id",
    "email",
    "hidden",
  ];
  protected readonly availableSets = [
    // 'operator_id',
    // 'territory_id',
    "email",
    "firstname",
    "lastname",
    // 'role',
    // 'password',
    "phone",
    "hidden",
    // 'status',
    // 'forgotten_token',
    // 'forgotten_at',
    "ui_status",
  ];
  protected readonly groupCastStatement = `CASE
      WHEN operator_id is not null THEN 'operators'
      WHEN territory_id is not null THEN 'territories'
      ELSE 'registry'
    END as group`;

  constructor(
    protected connection: LegacyPostgresConnection,
    protected config: ConfigInterfaceResolver,
  ) {
    this.defaultLimit = config.get("pagination.defaultLimit", 10);
    this.maxLimit = config.get("pagination.maxLimit", 1000);
  }

  private getPermissionsFromRole(role: string): string[] {
    return this.config.get(`permissions.${role}.permissions`, []);
  }

  async checkForDoubleEmailAndFail(email: string, userId = -1): Promise<void> {
    const query = {
      text: `SELECT _id FROM ${this.table} WHERE email = $1 AND _id != $2`,
      values: [email, userId],
    };

    const result = await this.connection.getClient().query<any>(query);
    if (result.rowCount > 0) {
      throw new ConflictException(`A User already has the email ${email}`);
    }
  }

  private coerceRole(data: UserCreateInterface): string {
    const [, level] = data.role.split(".");
    if (data.operator_id) return `operator.${level}`;
    if (data.territory_id) return `territory.${level}`;
    return `registry.${level}`;
  }

  private coerceHidden(data: UserCreateInterface): boolean {
    const [group] = data.role.split(".");
    return group === "registry" ? false : !!data.hidden;
  }

  async create(data: UserCreateInterface): Promise<UserFindInterface> {
    // status: 'pending',
    const query = {
      text: `
        WITH data as(
          INSERT INTO ${this.table} (
            email, firstname, lastname, role, phone, hidden, operator_id, territory_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8
          )
          RETURNING
            _id, status, created_at, updated_at, ui_status, email,
            firstname, lastname, role, phone, hidden, operator_id, territory_id
        )
      SELECT
        data.*,
        ${this.groupCastStatement}
      FROM data
      `,
      values: [
        data.email,
        data.firstname,
        data.lastname,
        this.coerceRole(data),
        data.phone,
        this.coerceHidden(data),
        data.operator_id,
        data.territory_id,
      ],
    };

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount !== 1) {
      throw new Error(`Unable to create user (${JSON.stringify(data)})`);
    }

    return {
      ...result.rows[0],
      permissions: this.getPermissionsFromRole(result.rows[0].role),
    };
  }

  protected async deleteWhere(
    id: number,
    where?: { operator_id?: number; territory_id?: number },
  ): Promise<boolean> {
    const query = {
      text: `
      DELETE FROM ${this.table}
        WHERE _id = $1
        ${where ? (where.operator_id ? "AND operator_id = $2" : "AND territory_id = $2") : ""}
      `,
      values: [id],
    };

    if (where) {
      query.values.push(
        (where.operator_id ? where.operator_id : where.territory_id) || 0,
      );
    }

    const result = await this.connection.getClient().query<any>(query);

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

  async deleteAssociated(key: string, value: number): Promise<void> {
    if (["territory_id", "operator_id"].indexOf(key) === -1) {
      throw new Error("Only territory_id and operator_id are supported keys");
    }

    await this.connection.getClient().query<any>({
      text: `
        DELETE FROM ${this.table}
        WHERE ${key} = $1
      `,
      values: [value],
    });
  }

  async list(
    filters: UserListFiltersInterface,
    pagination: PaginationParamsInterface,
  ): Promise<{ users: UserListInterface[]; total: number }> {
    const whereClauses = this.buildWhereClauses({ ...filters });

    const totalQuery = {
      text: `
        SELECT count(*) as total FROM ${this.table}
        ${whereClauses.text}
      `,
      values: whereClauses.values,
    };

    totalQuery.text = totalQuery.text.split("$#").reduce(
      (acc, current, idx, origin) => {
        if (idx === origin.length - 1) {
          return `${acc}${current}`;
        }

        return `${acc}${current}$${idx + 1}`;
      },
      "",
    );

    const totalResult = await this.connection.getClient().query<any>(
      totalQuery,
    );
    const total = Number(
      totalResult.rows.length === 1 ? totalResult.rows[0].total : -1,
    );

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
          hidden,
          operator_id,
          territory_id,
          ${this.groupCastStatement}
        FROM ${this.table}
        ${whereClauses.text}
        LIMIT ${limit}
        OFFSET ${offset}
      `,
      values: whereClauses.values,
    };

    query.text = query.text.split("$#").reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }

      return `${acc}${current}$${idx + 1}`;
    }, "");

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount === 0) {
      return {
        total,
        users: [],
      };
    }

    return {
      total,
      users: result.rows,
    };
  }

  protected buildWhereClauses(
    filters: Record<string, unknown>,
    join = "AND",
  ): { text: string; values: unknown[] } {
    // no filters -> no clauses
    if (!filters || Object.keys(filters).length === 0) {
      return { text: "", values: [] };
    }

    // white list filters
    const filtersToProcess = this.availableFilters.filter((key) => key in filters);
    if (filtersToProcess.length === 0) {
      return { text: "", values: [] };
    }

    // convert text to placeholders for prepared queries
    const orderedFilters = filtersToProcess
      .map((key) => ({ key, value: filters[key] }))
      .map((filter) => ({ text: `${filter.key} = $#`, values: [filter.value] }))
      .reduce(
        (acc: { text: Array<string>; values: Array<unknown> }, current) => {
          acc.text.push(current.text);
          acc.values.push(...current.values);
          return acc;
        },
        { text: [], values: [] },
      );

    const text = `WHERE ${orderedFilters.text.join(` ${join} `)}`;
    const { values } = orderedFilters;

    return { text, values };
  }

  protected async findWhere(where: {
    _id?: number;
    operator_id?: number;
    territory_id?: number;
    email?: string;
  }): Promise<UserFindInterface> {
    if (!where || Object.keys(where).length === 0) {
      throw new Error("Need to have a where clause");
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
          hidden,
          operator_id,
          territory_id,
          ui_status,
          ${this.groupCastStatement}
        FROM ${this.table}
        ${whereClauses.text}
        LIMIT 1
      `,
      values: whereClauses.values,
    };

    query.text = query.text.split("$#").reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }

      return `${acc}${current}$${idx + 1}`;
    }, "");
    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount === 0) {
      throw new Error("No change");
    }

    return {
      ...result.rows[0],
      permissions: this.getPermissionsFromRole(result.rows[0].role),
    };
  }

  async find(_id: number): Promise<UserFindInterface | undefined> {
    return this.findWhere({ _id });
  }

  async findByOperator(
    _id: number,
    operator_id: number,
  ): Promise<UserFindInterface | undefined> {
    return this.findWhere({ _id, operator_id });
  }

  async findByTerritory(
    _id: number,
    territory_id: number,
  ): Promise<UserFindInterface | undefined> {
    return this.findWhere({ _id, territory_id });
  }

  async findByEmail(email: string): Promise<UserFindInterface | undefined> {
    return this.findWhere({ email });
  }

  async findInactive(months = 6): Promise<UserLastLoginInterface[]> {
    const result = await this.connection.getClient().query<any>({
      text: `
        SELECT
          _id,
          CONCAT(
            EXTRACT(YEAR FROM age(last_login_at)),
            ' years ',
            EXTRACT(MONTH FROM age(last_login_at)),
            ' months ',
            EXTRACT(DAY FROM age(last_login_at)),
            ' days'
          ) AS ago,
          last_login_at,
          CONCAT(firstname, ' ', lastname) AS name,
          email,
          role,
          status
        FROM ${this.table}
        WHERE last_login_at < NOW() - $1::interval
        ORDER BY last_login_at DESC
      `,
      values: [`${months} months`],
    });

    return result.rowCount ? result.rows : [];
  }

  protected buildSetClauses(sets: UserPatchInterface): {
    text: string;
    values: unknown[];
  } {
    const setToProcess = this.availableSets.filter((key) => key in sets);

    if (setToProcess.length === 0) {
      throw new Error("Please add something to modify :)");
    }

    const finalSets = setToProcess
      .map((key) => ({ key, value: get(sets, key) }))
      .map((filter) => ({ text: `${filter.key} = $#`, values: [filter.value] }))
      .reduce(
        (acc: { text: Array<string>; values: Array<unknown> }, current) => {
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
      text: finalSets.text.join(", "),
      values: finalSets.values,
    };
  }
  protected async patchWhere(
    data: UserPatchInterface,
    where: { _id: number; operator_id?: number; territory_id?: number },
  ): Promise<UserFindInterface | undefined> {
    if (
      !data || !where || Object.keys(data).length === 0 ||
      Object.keys(where).length === 0
    ) {
      throw new Error("Patch need to have a where clause");
    }

    const setClauses = this.buildSetClauses(data);
    const whereClauses = this.buildWhereClauses(where);

    const query = {
      text: `
        WITH data as(
        UPDATE ${this.table}
          SET ${setClauses.text}
          ${whereClauses.text}
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
          hidden,
          operator_id,
          territory_id
        )
      SELECT
        data.*,
        ${this.groupCastStatement}
      FROM data
      `,
      values: [...setClauses.values, ...whereClauses.values],
    };

    query.text = query.text.split("$#").reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }
      return `${acc}${current}$${idx + 1}`;
    }, "");

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount !== 1) {
      return;
    }

    return {
      ...result.rows[0],
      permissions: this.getPermissionsFromRole(result.rows[0].role),
    };
  }

  async patch(
    _id: number,
    data: UserPatchInterface,
  ): Promise<UserFindInterface | undefined> {
    return this.patchWhere(data, { _id });
  }

  async patchRole(
    _id: number,
    role: string,
    roleSuffixOnly?: boolean,
  ): Promise<void | undefined> {
    let finalRole = role;
    if (roleSuffixOnly) {
      const user = await this.find(_id);
      if (!user) throw new NotFoundException();
      switch (user.group) {
        case "territories":
          finalRole = `territory.${role}`;

          break;

        case "operators":
          finalRole = `operator.${role}`;

          break;
        default:
          finalRole = `${user.group}.${role}`;

          break;
      }
    }

    const query = {
      text: `UPDATE ${this.table}
          SET role = $1 
          WHERE _id = $2`,
      values: [finalRole, _id],
    };

    await this.connection.getClient().query<any>(query);
  }

  async patchByOperator(
    _id: number,
    data: UserPatchInterface,
    operator_id: number,
  ): Promise<UserFindInterface | undefined> {
    return this.patchWhere(data, { _id, operator_id });
  }

  async patchByTerritory(
    _id: number,
    data: UserPatchInterface,
    territory_id: number,
  ): Promise<UserFindInterface | undefined> {
    return this.patchWhere(data, { _id, territory_id });
  }

  async hasUsers(): Promise<HasUsersResultInterface> {
    const results = await this.connection.getClient().query<any>({
      text: `
        SELECT
          array_remove(array_agg(distinct operator_id), NULL) AS operators,
          array_remove(array_agg(distinct territory_id), NULL) AS territories
        FROM auth.users
        WHERE operator_id IS NOT NULL
        OR territory_id IS NOT NULL;
      `,
    });

    return results.rowCount ? results.rows[0] : [];
  }

  async touchLastLogin(_id: number): Promise<void> {
    await this.connection.getClient().query<any>({
      text: `UPDATE ${this.table} SET last_login_at = NOW() WHERE _id = $1`,
      values: [_id],
    });
  }
}
