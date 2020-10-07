import { provider, ConfigInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { StatInterface } from '../interfaces/StatInterface';
import {
  TargetInterface,
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

  constructor(
    public connection: PostgresConnection,
    private config: ConfigInterfaceResolver,
    private crypto: CryptoProviderInterfaceResolver,
  ) {}

  public async getOrBuild(fn: Function, target: TargetInterface): Promise<StatInterface[]> {
    const hash = this.genHash(target);
    const result = await this.connection.getClient().query({
      text: `
        SELECT data
        FROM ${this.table}
        WHERE hash = $1
        AND (extract(epoch from age(now(), updated_at)) / 3600) < $2
        LIMIT 1
      `,
      values: [hash, this.config.get('cache.expireInHours', 24)],
    });

    if (result.rowCount !== 1) {
      console.log(`[stat cache miss] hash ${hash}`);

      const data = await fn();
      await this.save(hash, target, data);
      return data;
    }

    console.log(`[stat cache hit] hash ${hash}`);

    return result.rows[0].data;
  }

  private genHash(target: TargetInterface): string {
    return this.crypto.md5(JSON.stringify(target));
  }

  /**
   * Save the stat_cache entry
   */
  protected async save(hash: string, target: TargetInterface, data: StatInterface): Promise<void> {
    // first, clean up the matching target before recreating
    // UNIQUE index fails on NULL values. It is safer to force delete
    // the entry before redoing the insert.
    await this.cleanup(target);

    try {
      const result = await this.connection.getClient().query({
        text: `
        INSERT INTO ${this.table} (
          hash,
          data
        ) VALUES (
          $1::varchar,
          $2::json
        )
      `,
        values: [hash, JSON.stringify(data)],
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
      const deleted = await this.connection.getClient().query({
        text: `DELETE FROM ${this.table} WHERE hash = $1`,
        values: [this.genHash(target)],
      });

      return deleted.rowCount === 1;
    } catch (e) {
      console.log('[stat cache cleanup]', e.message);
      return false;
    }
  }
}
