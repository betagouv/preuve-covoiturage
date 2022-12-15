import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  LockInformationInterface,
  PolicyRepositoryProviderInterfaceResolver,
  SerializedPolicyInterface,
} from '../interfaces';

@provider({
  identifier: PolicyRepositoryProviderInterfaceResolver,
})
export class PolicyRepositoryProvider implements PolicyRepositoryProviderInterfaceResolver {
  public readonly table = 'policy.policies';
  public readonly lockTable = 'policy.lock';
  public readonly getTerritorySelectorFn = 'territory.get_selector_by_territory_id';

  constructor(protected connection: PostgresConnection) {}

  async getLock(): Promise<void> {
    const conn = await this.connection.getClient().connect();
    await conn.query('BEGIN');
    try {
      const res = await conn.query(
        `SELECT true FROM ${this.lockTable} WHERE _id = 1 AND stopped_at IS NOT NULL FOR UPDATE SKIP LOCKED`,
      );
      if (res.rowCount != 1) {
        throw new Error('Locked !');
      }
      await conn.query(`
        UPDATE ${this.lockTable}
        SET _id = nextval('policy.lock__id_seq')
        WHERE _id = 1
      `);
      await conn.query(`
        INSERT INTO ${this.lockTable} (_id, started_at) VALUES (1, NOW())
      `);
      await conn.query('COMMIT');
    } catch (e) {
      await conn.query('ROLLBACK');
    } finally {
      conn.release();
    }
  }

  async releaseLock(lockInformation: LockInformationInterface): Promise<void> {
    await this.connection.getClient().query({
      text: `UPDATE ${this.lockTable} SET
        stopped_at = now(),
        from_date = $1,
        to_date = $2
        success = $3
        error = $4
      WHERE _id = 1 AND stopped_at IS NULL
      `,
      values: [
        lockInformation.from_date,
        lockInformation.to_date,
        lockInformation.error ? false : true,
        lockInformation.error && lockInformation.error instanceof Error
          ? JSON.stringify(lockInformation.error, Object.getOwnPropertyNames(lockInformation.error))
          : undefined,
      ],
    });
  }

  async find(id: number, territoryId?: number): Promise<SerializedPolicyInterface | undefined> {
    const query = {
      text: `
        SELECT
          pp._id,
          sel.selector as territory_selector,
          pp.name,
          pp.start_date,
          pp.end_date,
          pp.handler,
          pp.status,
          pp.territory_id,
          pp.incentive_sum
        FROM ${this.table} as pp,
        LATERAL (
          SELECT * FROM ${this.getTerritorySelectorFn}(ARRAY[pp.territory_id])
        ) as sel
        WHERE pp._id = $1
        AND pp.deleted_at IS NULL
        ${!!territoryId ? 'AND pp.territory_id = $2' : ''}
        LIMIT 1
      `,
      values: [id, ...(territoryId ? [territoryId] : [])],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return undefined;
    }

    return result.rows[0];
  }

  async create(data: Omit<SerializedPolicyInterface, '_id'>): Promise<SerializedPolicyInterface> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          territory_id,
          start_date,
          end_date,
          name,
          status,
          handler
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING _id
      `,
      values: [data.territory_id, data.start_date, data.end_date, data.name, data.status, data.handler],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create campaign (${JSON.stringify(data)})`);
    }

    return await this.find(result.rows[0]._id);
  }

  async patch(data: SerializedPolicyInterface): Promise<SerializedPolicyInterface> {
    const query = {
      text: `
      UPDATE ${this.table}
        SET
           name = $2,
           start_date = $3,
           end_date = $4,
           handler = $5,
           status = $6
        WHERE _id = $1
        AND deleted_at IS NULL
        RETURNING _id
      `,
      values: [data._id, data.name, data.start_date, data.end_date, data.handler, data.status],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new NotFoundException(`campaign not found (${data._id})`);
    }

    return await this.find(result.rows[0]._id);
  }

  async delete(id: number): Promise<void> {
    const query = {
      text: `
      UPDATE ${this.table}
        SET deleted_at = NOW()
        WHERE _id = $1 AND deleted_at IS NULL
      `,
      values: [id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new NotFoundException(`Campaign not found (${id})`);
    }

    return;
  }

  async listApplicablePoliciesId(): Promise<number[]> {
    const results = await this.connection.getClient().query("SELECT _id FROM policy.policies WHERE status = 'active'");
    return results.rows.map((r) => r._id);
  }

  async findWhere(search: {
    _id?: number;
    territory_id?: number | null | number[];
    status?: string;
    datetime?: Date;
    ends_in_the_future?: boolean;
  }): Promise<SerializedPolicyInterface[]> {
    const values = [];
    const whereClauses = ['deleted_at IS NULL'];
    for (const key of Reflect.ownKeys(search)) {
      switch (key) {
        case '_id':
          values.push(search[key]);
          whereClauses.push(`pp._id = $${values.length}`);
          break;
        case 'status':
          values.push(search[key]);
          whereClauses.push(`pp.status::text = $${values.length}`);
          break;
        case 'territory_id':
          const tid = search[key];
          if (tid === null) {
            whereClauses.push('pp.territory_id IS NULL');
          } else if (Array.isArray(tid)) {
            values.push(tid);
            whereClauses.push(`pp.territory_id = ANY($${values.length}::int[])`);
          } else {
            values.push(tid);
            whereClauses.push(`pp.territory_id = $${values.length}::int`);
          }
          break;
        case 'datetime':
          values.push(search[key]);
          whereClauses.push(
            `pp.start_date <= $${values.length}::timestamp AND pp.end_date >= $${values.length}::timestamp`,
          );
          break;
        case 'ends_in_the_future':
          whereClauses.push(`pp.end_date ${search[key] ? '>' : '<'} NOW()`);
          break;
        default:
          break;
      }
    }
    const query = {
      values,
      text: `
        SELECT
          pp._id,
          sel.selector as territory_selector,
          pp.name,
          pp.start_date,
          pp.end_date,
          pp.handler,
          pp.status,
          pp.territory_id,
          pp.incentive_sum
        FROM ${this.table} as pp,
        LATERAL (
          SELECT * FROM ${this.getTerritorySelectorFn}(ARRAY[pp.territory_id])
        ) as sel
        WHERE ${whereClauses.join(' AND ')}
      `,
    };

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }

  /**
   * List all operator_id having valid trips for a given campaign.
   *
   * This approach, although slower, is based on data on the contrary
   * to instantiating the campaign engine class and getting the list
   * of operators from the params() method. The latter does not keep
   * history of in-campaign deleted operators.
   *
   * TODO de-duplicate with api/services/trip/src/providers/TripRepositoryProvider.ts:529
   */
  async activeOperators(policy_id: number): Promise<number[]> {
    const query = {
      text: `
        SELECT cc.operator_id
        FROM policy.incentives pi
        JOIN carpool.carpools cc ON cc._id = pi.carpool_id
        JOIN policy.policies pp ON pp._id = $1
        WHERE
              cc.datetime >= pp.start_date
          AND cc.datetime <  pp.end_date
          AND pi.policy_id = $1
          AND pi.state = 'regular'
        GROUP BY cc.operator_id
        ORDER BY cc.operator_id
      `,
      values: [policy_id],
    };

    const result = await this.connection.getClient().query(query);
    return result.rowCount ? result.rows.map((o: { operator_id: number }) => o.operator_id) : [];
  }
}
