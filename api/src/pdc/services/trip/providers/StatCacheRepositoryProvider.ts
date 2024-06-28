import { ConfigInterfaceResolver, provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";

import { createHash } from "@/lib/crypto/index.ts";
import { logger } from "@/lib/logger/index.ts";
import {
  StatCacheRepositoryProviderInterface,
  StatCacheRepositoryProviderInterfaceResolver,
} from "../interfaces/StatCacheRepositoryProviderInterface.ts";
import { StatInterface } from "../interfaces/StatInterface.ts";

/*
 * Trip stat repository
 */
@provider({
  identifier: StatCacheRepositoryProviderInterfaceResolver,
})
export class StatCacheRepositoryProvider
  implements StatCacheRepositoryProviderInterface {
  public readonly table = "trip.stat_cache";

  constructor(
    public connection: PostgresConnection,
    private config: ConfigInterfaceResolver,
  ) {}

  public async getOrBuild(fn: Function, target: any): Promise<StatInterface[]> {
    const hash = await createHash(JSON.stringify(target));
    const result = await this.connection.getClient().query<any>({
      text: `
        SELECT data
        FROM ${this.table}
        WHERE hash = $1
        AND (extract(epoch from age(now(), updated_at)) / 3600) < $2
        LIMIT 1
      `,
      values: [hash, this.config.get("cache.expireInHours", 24)],
    });

    if (result.rowCount !== 1) {
      logger.info(`[stat cache miss] hash ${hash}`);

      const data = await fn();
      await this.save(hash, target, data);
      return data;
    }

    logger.info(`[stat cache hit] hash ${hash}`);

    return result.rows[0].data;
  }

  /**
   * Save the stat_cache entry
   */
  protected async save(
    hash: string,
    target: any,
    data: StatInterface,
  ): Promise<void> {
    // first, clean up the matching target before recreating
    // UNIQUE index fails on NULL values. It is safer to force delete
    // the entry before redoing the insert.
    await this.cleanup(hash);

    try {
      const result = await this.connection.getClient().query<any>({
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
        throw new Error(
          `Unable to create or update stats cache for ${
            JSON.stringify(target)
          }`,
        );
      }

      return;
    } catch (e) {
      logger.info("[stat cache save]", e.message);
    }
  }

  /**
   * Remove the matching stat_cache entry
   */
  protected async cleanup(hash: string): Promise<boolean> {
    try {
      const deleted = await this.connection.getClient().query<any>({
        text: `DELETE FROM ${this.table} WHERE hash = $1`,
        values: [hash],
      });

      return deleted.rowCount === 1;
    } catch (e) {
      logger.info("[stat cache cleanup]", e.message);
      return false;
    }
  }
}
