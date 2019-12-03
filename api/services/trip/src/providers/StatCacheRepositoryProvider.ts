import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { StatInterface } from '../interfaces/StatInterface';
import {
  StatCacheRepositoryProviderInterface,
  StatCacheRepositoryProviderInterfaceResolver,
} from '../interfaces/StatCacheRepositoryProviderInterface';
/*
 * Trip stat repository
 */
@provider({
  identifier: StatCacheRepositoryProviderInterfaceResolver,
})
export class StatCacheRepositoryProvider implements StatCacheRepositoryProviderInterface {
  public readonly table = 'trip.stat_cache';

  constructor(public connection: PostgresConnection) {}

  public async getGeneralOrBuild(fn: Function): Promise<StatInterface[]> {
    const result = await this.connection.getClient().query(`
        SELECT
          data
        FROM ${this.table}
        WHERE is_public = true AND operator_id IS NULL AND territory_id IS NULL
        AND extract(hour from age(now(), updated_at)) < 24
        LIMIT 1
      `);
    if (result.rowCount !== 1) {
      const data = await fn();
      await this.save({ public: true }, data);
      return data;
    }
    return result.rows[0].data;
  }

  public async getTerritoryOrBuild(territory_id: number, fn: Function): Promise<StatInterface[]> {
    const result = await this.connection.getClient().query({
      text: `
        SELECT
          data
        FROM ${this.table}
        WHERE territory_id = $1::int
        AND extract(hour from age(now(), updated_at)) < 24
        LIMIT 1
      `,
      values: [territory_id],
    });
    if (result.rowCount !== 1) {
      const data = await fn();
      await this.save({ territory_id, public: false }, data);
      return data;
    }
    return result.rows[0].data;
  }

  public async getOperatorOrBuild(operator_id: number, fn: Function): Promise<StatInterface[]> {
    const result = await this.connection.getClient().query({
      text: `
        SELECT
          data
        FROM ${this.table}
        WHERE operator_id = $1::int
        AND extract(hour from age(now(), updated_at)) < 24
        LIMIT 1
      `,
      values: [operator_id],
    });
    if (result.rowCount !== 1) {
      const data = await fn();
      await this.save({ operator_id, public: true }, data);
      return data;
    }
    return result.rows[0].data;
  }

  protected async save(
    target: {
      public?: boolean;
      operator_id?: number;
      territory_id?: number;
    },
    data: StatInterface,
  ): Promise<void> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          is_public,
          territory_id,
          operator_id,
          data
        ) VALUES (
          $1::boolean,
          $2::int,
          $3::int,
          $4::json
        )
        ON CONFLICT (is_public, territory_id, operator_id)
        DO UPDATE SET
          data = $4::json,
          updated_at = $5
      `,
      values: [
        'public' in target ? target.public : false,
        target.territory_id,
        target.operator_id,
        JSON.stringify(data),
        new Date(),
      ],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create or update stats cache for ${JSON.stringify(target)}`);
    }
    return;
  }
}
