import { NotFoundException, provider } from "@/ilos/common/index.ts";
import { LegacyPostgresConnection, PoolClient } from "@/ilos/connection-postgres/index.ts";
import { TerritoryParams } from "@/pdc/services/territory/actions/group/ListTerritoryActionV2.ts";
import { TerritorySelectorsInterface } from "@/pdc/services/territory/contracts/common/interfaces/TerritoryCodeInterface.ts";
import {
  CreateParamsInterface,
  CreateResultInterface,
  ListResultInterface,
  TerritoryRepositoryProviderInterface,
  TerritoryRepositoryProviderInterfaceResolver,
} from "../interfaces/TerritoryRepositoryProviderInterface.ts";

@provider({
  identifier: TerritoryRepositoryProviderInterfaceResolver,
})
export class TerritoryRepositoryProvider implements TerritoryRepositoryProviderInterface {
  public readonly table = "territory.territory_group";
  public readonly relationTable = "territory.territory_group_selector";
  public readonly GROUP_DEFAULT_SHORT_NAME = "";

  constructor(protected connection: LegacyPostgresConnection) {}

  async list(params: TerritoryParams): Promise<ListResultInterface> {
    const { id, search, offset, limit, operator_id, policy } = { limit: 100, offset: 0, ...params };
    const values: unknown[] = [];
    const whereClauses: string[] = [];

    const bind = (value: unknown): string => {
      values.push(value);
      return `$${values.length}`;
    };

    if (id) {
      whereClauses.push(`tg._id = ${bind(id)}`);
    }

    if (search) {
      // `%` et `_` sont des jokers LIKE.
      const needle = `%${search.toLowerCase().replace(/([%_\\])/g, "\\$1")}%`;
      const placeholder = bind(needle);
      whereClauses.push(
        `(LOWER(tg.name) LIKE ${placeholder} ESCAPE '\\' OR cc.siret LIKE ${placeholder} ESCAPE '\\')`,
      );
    }

    const client = this.connection.getClient();
    if (policy === true) {
      const policyQuery = {
        text: `
        SELECT DISTINCT(territory_id) as _id
        FROM policy.policies
        WHERE deleted_at IS NULL AND status = 'active'`,
      };
      const policiesResults = await client.query<any>(policyQuery);

      if (policiesResults.rowCount === 0) {
        return {
          data: [],
          meta: { pagination: { offset, limit, total: 0 } },
        };
      }
      const policyTerritoryIds = policiesResults.rows.map((r: { _id: number }) => r._id);
      whereClauses.push(`tg._id = ANY (${bind(policyTerritoryIds)}::int[])`);
    }
    if (operator_id) {
      const operatorQuery = {
        text: `
        WITH operator_incentives AS (SELECT DISTINCT(policy_id) FROM policy.incentives WHERE operator_id = $1)
        SELECT DISTINCT(tg._id) FROM policy.policies pp
        JOIN territory.territory_group tg ON tg._id = pp.territory_id
        WHERE pp._id IN (SELECT * FROM operator_incentives)`,
        values: [operator_id],
      };

      const territoriesForOperatorResults = await client.query<any>(operatorQuery);

      if (territoriesForOperatorResults.rowCount === 0) {
        return {
          data: [],
          meta: { pagination: { offset, limit, total: 0 } },
        };
      }

      const operatorTerritoryIds = territoriesForOperatorResults.rows.map((r: { _id: number }) => r._id);
      whereClauses.push(`tg._id = ANY (${bind(operatorTerritoryIds)}::int[])`);
    }

    const where = ["tg.deleted_at IS NULL", ...whereClauses].join(" AND ");

    const countQuery = `SELECT count(*) as territory_count from ${this.table} as tg
      LEFT JOIN company.companies cc ON cc._id = tg.company_id
      WHERE ${where}`;

    const total = parseFloat(
      (
        await client.query<any>({
          text: countQuery,
          values,
        })
      ).rows[0].territory_count,
    );

    const limitPlaceholder = bind(limit);
    const offsetPlaceholder = bind(offset);
    const query = {
      text: `
        SELECT tg._id, tg.name, cc.siret FROM ${this.table} as tg
        LEFT JOIN company.companies cc ON cc._id = tg.company_id
        WHERE ${where}
        ORDER BY tg.name ASC
        LIMIT ${limitPlaceholder}
        OFFSET ${offsetPlaceholder}
      `,
      values,
    };
    const result = await client.query<any>(query);
    return {
      data: result.rows,
      meta: { pagination: { offset, limit, total } },
    };
  }

  async create(data: CreateParamsInterface): Promise<CreateResultInterface> {
    const connection = await this.connection.getClient().connect();
    await connection.query<any>("BEGIN");
    try {
      const fields = ["name", "shortname", "contacts", "address", "company_id"];

      const values: any[] = [
        data.name,
        this.GROUP_DEFAULT_SHORT_NAME,
        data.contacts,
        data.address,
        data.company_id,
      ];

      const query = {
        text: `
          INSERT INTO ${this.table} (${fields.join(",")})
          VALUES (${fields.map((data, ind) => `$${ind + 1}`).join(",")})
          RETURNING *
        `,
        values,
      };

      const result = await connection.query<any>(query);
      if (result.rowCount !== 1) {
        throw new Error(`Unable to create territory (${JSON.stringify(data)})`);
      }

      const resultData = result.rows[0];

      if (data.selector) {
        await this.syncSelector(connection, resultData._id, data.selector);
      }

      await connection.query<any>("COMMIT");
      return { ...resultData, selector: data.selector };
    } catch (e) {
      await connection.query<any>("ROLLBACK");
      throw e;
    } finally {
      connection.release();
    }
  }

  protected async syncSelector(
    connection: PoolClient,
    groupId: number,
    selector: TerritorySelectorsInterface,
  ): Promise<void> {
    const values: [number[], string[], string[]] = Object.keys(selector)
      .map((type) =>
        selector[type].map((
          value: string | number,
        ) => [groupId, type, value.toString()])
      )
      .reduce((arr, v) => [...arr, ...v], [])
      .reduce(
        (arr, v) => {
          arr[0].push(v[0]);
          arr[1].push(v[1]);
          arr[2].push(v[2]);
          return arr;
        },
        [[], [], []],
      );
    await connection.query<any>({
      text: `
        DELETE FROM ${this.relationTable}
        WHERE territory_group_id = $1
      `,
      values: [groupId],
    });

    const query = {
      text: `
        INSERT INTO ${this.relationTable} (
          territory_group_id,
          selector_type,
          selector_value
        ) 
        SELECT * FROM UNNEST($1::int[], $2::varchar[], $3::varchar[])`,
      values,
    };

    await connection.query<any>(query);
    return;
  }

  async delete(id: number): Promise<void> {
    const query = {
      text: `
      UPDATE ${this.table}
        SET deleted_at = NOW()
        WHERE _id = $1
      `,
      values: [id],
    };

    const result = await this.connection.getClient().query<any>(query);

    if (result.rowCount !== 1) {
      throw new NotFoundException(`territory not found (${id})`);
    }

    return;
  }
}
