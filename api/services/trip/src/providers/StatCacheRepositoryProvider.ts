import { provider, ConfigInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { StatInterface } from '../interfaces/StatInterface';
import {
  StatCacheRepositoryProviderInterface,
  StatCacheRepositoryProviderInterfaceResolver,
} from '../interfaces/StatCacheRepositoryProviderInterface';

interface TargetInterface {
  public?: boolean;
  operator_id?: number;
  territory_id?: number;
}

/*
 * Trip stat repository
 */
@provider({
  identifier: StatCacheRepositoryProviderInterfaceResolver,
})
export class StatCacheRepositoryProvider implements StatCacheRepositoryProviderInterface {
  public readonly table = 'trip.stat_cache';

  constructor(public connection: PostgresConnection, private config: ConfigInterfaceResolver) {}

  public async getGeneralOrBuild(fn: Function): Promise<StatInterface[]> {
    const result = await this.connection.getClient().query({
      text: `
      SELECT
        data
      FROM ${this.table}
      WHERE is_public = true AND operator_id IS NULL AND territory_id IS NULL
      AND (extract(epoch from age(now(), updated_at)) / 3600) < $1
      LIMIT 1
    `,
      values: [this.config.get('cache.expireInHours', 24)],
    });

    if (result.rowCount !== 1) {
      console.log('[stat cache miss] public');

      const data = await fn();
      await this.save({ public: true }, data);
      return data;
    }

    console.log('[stat cache hit] public');

    return result.rows[0].data;
  }

  public async getTerritoryOrBuild(territory_id: number, fn: Function): Promise<StatInterface[]> {
    const result = await this.connection.getClient().query({
      text: `
        SELECT
          data
        FROM ${this.table}
        WHERE territory_id = $1::int
        AND (extract(epoch from age(now(), updated_at)) / 3600) < $2
        LIMIT 1
      `,
      values: [territory_id, this.config.get('cache.expireInHours', 24)],
    });
    if (result.rowCount !== 1) {
      console.log(`[stat cache miss] territory ${territory_id}`);

      const data = await fn();
      await this.save({ territory_id, public: false }, data);
      return data;
    }

    console.log(`[stat cache hit] territory ${territory_id}`);

    return result.rows[0].data;
  }

  public async getOperatorOrBuild(operator_id: number, fn: Function): Promise<StatInterface[]> {
    const result = await this.connection.getClient().query({
      text: `
        SELECT
          data
        FROM ${this.table}
        WHERE operator_id = $1::int
        AND (extract(epoch from age(now(), updated_at)) / 3600) < $2
        LIMIT 1
      `,
      values: [operator_id, this.config.get('cache.expireInHours', 24)],
    });
    if (result.rowCount !== 1) {
      console.log(`[stat cache miss] operator ${operator_id}`);

      const data = await fn();
      await this.save({ operator_id, public: false }, data);
      return data;
    }

    console.log(`[stat cache hit] operator ${operator_id}`);

    return result.rows[0].data;
  }

  /**
   * Save the stat_cache entry
   */
  protected async save(target: TargetInterface, data: StatInterface): Promise<void> {
    // first, clean up the matching target before recreating
    // UNIQUE index fails on NULL values. It is safer to force delete
    // the entry before redoing the insert.
    await this.cleanup(target);

    try {
      const result = await this.connection.getClient().query({
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
      `,
        values: [
          'public' in target ? target.public : false,
          target.territory_id,
          target.operator_id,
          JSON.stringify(data),
        ],
      });

      if (result.rowCount !== 1) {
        throw new Error(`Unable to create or update stats cache for ${JSON.stringify(target)}`);
      }

      return;
    } catch (e) {
      console.log('[stat cache save]', e.message);
    }
  }

  /**
   * Remove the matching stat_cache entry
   */
  protected async cleanup(target: TargetInterface): Promise<boolean> {
    try {
      // make sure the _id are numbers and write them in the query to avoid complex building of the values array
      const territoryClause = target.territory_id
        ? `territory_id=${Number(target.territory_id)}`
        : 'territory_id IS NULL';
      const operatorClause = target.operator_id ? `operator_id=${Number(target.operator_id)}` : 'operator_id IS NULL';

      const deleted = await this.connection.getClient().query({
        text: `DELETE FROM ${this.table} WHERE is_public=$1::boolean AND ${territoryClause} AND ${operatorClause}`,
        values: [!!target.public],
      });

      return deleted.rowCount === 1;
    } catch (e) {
      console.log('[stat cache cleanup]', e.message);
      return false;
    }
  }
}
