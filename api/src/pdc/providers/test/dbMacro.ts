import { LegacyPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { env, env_or_false } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { Migrator } from "../migration/index.ts";

interface Config {
  connectionString: string;
}

export interface DbContext {
  db: Migrator;
  connection: LegacyPostgresConnection;
}

export interface DbBeforeAfter {
  before(): Promise<DbContext>;
  after(cfg: DbContext): Promise<void>;
}

/**
 * Export helpers to create a clean up a test database before and after tests
 *
 * You can pass a connectionString in the config to override the default
 * APP_POSTGRES_URL environment variable.
 *
 * @example
 * import { DbContext, makeDbBeforeAfter } from "@/pdc/providers/test/dbMacro.ts";
 *
 * const { before, after } = makeDbBeforeAfter();
 * let db: DbContext;
 *
 * beforeAll(async () => {
 *    db = await before();
 * });
 * afterAll(async () => {
 *   await after(db);
 * });
 *
 * @param {Config} cfg
 * @returns
 */
export function makeDbBeforeAfter(cfg?: Config): DbBeforeAfter {
  return {
    before: async (): Promise<DbContext> => {
      const connectionString = cfg?.connectionString ||
        env("APP_POSTGRES_URL") ||
        "postgresql://postgres:postgres@localhost:5432/local";
      const db = new Migrator(connectionString);
      await db.create();
      await db.migrate({ flash: false, verbose: false });
      await db.seed();

      return { db, connection: db.testConn };
    },
    after: async (ctx: DbContext): Promise<void> => {
      // Test databases can be kept for inspection by setting the env var
      // APP_POSTGRES_KEEP_TEST_DATABASES to 'true'
      // use `just drop_test_databases` in your shell to clear them.
      if (
        env_or_false("APP_POSTGRES_KEEP_TEST_DATABASES")
      ) {
        logger.info(
          `[db-macro] Keeping the test database: ${
            ctx?.db?.dbName || "undefined"
          } run 'just drop_test_databases to clear'`,
        );
      } else {
        await ctx.db.drop();
      }

      ctx && ctx.db && await ctx.db.down();
    },
  };
}
