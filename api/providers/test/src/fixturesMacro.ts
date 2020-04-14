import fs from 'fs';
import path from 'path';
import anyTest, { TestInterface } from 'ava';

import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';

export interface MacroTestContext {
  pgAdmin: PostgresConnection;
  pg: PostgresConnection;
  pool: PoolClient;
  // TODO add redis ?
}

interface TestConfig {
  basePath: string;
  pgConnectionString: string | null;
  database: string | null;
  fullMode: boolean;
  sources: string[];
}

export function fixturesMacro<TestContext = unknown>(
  cfg: Partial<TestConfig> = {},
): { test: TestInterface<TestContext & MacroTestContext> } {
  const config = {
    basePath: __dirname,
    pgConnectionString: process.env.APP_POSTGRES_URL,
    database: `fixture_${new Date().getTime()}`,
    fullMode: true,
    /**
     * list all fixtures by their filename (without .sql extension)
     * - order of the array is respected
     * - /!\ schemas.sql is always called before the fixtures
     * - the test can override this array by passing { sources: [] } to the config.
     *   watch out for broken relationships if you do that!
     */
    sources: ['roles', 'users', 'companies', 'operators', 'territories'],
    ...cfg,
  };

  const test = anyTest as TestInterface<TestContext & MacroTestContext>;

  test.before(async (t) => {
    // create database with admin connection
    t.context.pgAdmin = new PostgresConnection({ connectionString: config.pgConnectionString });
    await t.context.pgAdmin.getClient().query(`CREATE DATABASE ${config.database}`);
    t.log(`Create database ${config.database}`);

    // create a connection and a pool for the client with this database
    const clientConnectionString = config.pgConnectionString.replace(/\/[a-z_\-0-9]+$/i, `/${config.database}`);
    t.context.pg = new PostgresConnection({ connectionString: clientConnectionString });
    t.context.pool = await t.context.pg.getClient().connect();

    try {
      await t.context.pool.query('BEGIN');

      // flash schemas
      const fixturesFolder = path.join(config.basePath, 'fixtures');
      t.log('Fixtures folder', fixturesFolder);

      if (!fs.existsSync(`${fixturesFolder}/schemas.sql`)) throw new Error('schemas.sql file not found');
      const schemasSql = fs.readFileSync(`${fixturesFolder}/schemas.sql`, { encoding: 'utf8' });

      t.log('Create schemas');
      await t.context.pool.query(schemasSql);

      // flash data
      for (const source of config.sources) {
        const path = `${fixturesFolder}/${source}.sql`;
        t.log(`Flash ${source}.sql`);
        if (fs.existsSync(path)) {
          const sql = fs.readFileSync(path, { encoding: 'utf8' });
          await t.context.pool.query(sql);
        } else {
          console.warn(`Failed to execute ${path}`);
        }
      }

      await t.context.pool.query('COMMIT');
    } catch (e) {
      await t.context.pool.query('ROLLBACK');
      console.error(e);
    }
  });

  test.after.always(async (t) => {
    t.context.pool.release();
    await t.context.pg.down();
    await t.context.pgAdmin.getClient().query(`DROP DATABASE ${config.database}`);
    await t.context.pgAdmin.down();
    t.log('cleaned up');
  });

  return { test };
}
