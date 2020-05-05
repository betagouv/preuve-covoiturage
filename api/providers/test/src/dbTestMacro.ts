import fs from 'fs';
import path from 'path';
import { TestInterface } from 'ava';

import { NewableType } from '@ilos/common';
import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';

import { uuid } from './helpers';
import { Generator } from './fixtures/generators/Generator';
import { IdentityGenerator } from './fixtures/generators/IdentityGenerator';
import { TripGenerator } from './fixtures/generators/TripGenerator';
import { identities } from './fixtures/identities';

interface TestConfig {
  basePath: string;
  pgConnectionString: string | null;
  database: string | null;
  fullMode: boolean;
  sources: (string | { cls: NewableType<Generator<unknown>>; args?: any[] })[];
}

interface DbConfigInterface {
  pgConnectionString: string;
  database: string;
  tmpConnectionString: string;
}

export interface MacroTestContext {
  pgAdmin: PostgresConnection;
  pg: PostgresConnection;
  pool: PoolClient;
  config: TestConfig;
  // TODO add redis ?
}

export function getDbConfig({
  pgConnectionString,
  database,
}: Partial<{
  pgConnectionString: string;
  database: string;
}> = {}): DbConfigInterface {
  pgConnectionString = pgConnectionString || process.env.APP_POSTGRES_URL;
  database = database || `fixtures_${uuid().replace(/-/g, '_')}`;

  return {
    pgConnectionString,
    database,
    tmpConnectionString: pgConnectionString.replace(/\/[a-z_\-0-9]+$/i, `/${database}`),
  };
}

export function dbTestMacro<TestContext = unknown>(
  anyTest: TestInterface,
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
    sources: [
      'roles',
      'users',
      'companies',
      'operators',
      'territories',
      'insee_atlantis',
      'insee_olympus',
      'insee_atlantis_pivot',
      'insee_olympus_pivot',
      { cls: IdentityGenerator },
      { cls: TripGenerator, args: [{ identities, inserts: 100 }] },
    ],
    ...cfg,
  };

  const test = anyTest as TestInterface<TestContext & MacroTestContext>;

  test.serial.before(async (t) => {
    t.context.config = config;

    // create database with admin connection
    t.context.pgAdmin = new PostgresConnection({ connectionString: config.pgConnectionString });
    await t.context.pgAdmin.getClient().query(`CREATE DATABASE ${config.database}`);
    t.log(`Create database ${config.database}`);

    // create a connection and a pool for the client with this database
    const clientConnectionString = config.pgConnectionString.replace(/\/[a-z_\-0-9]+$/i, `/${config.database}`);
    process.env.APP_POSTGRES_URL = clientConnectionString;
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
        if (typeof source === 'string') {
          const path = `${fixturesFolder}/${source}.sql`;
          t.log(`Flash ${source}.sql`);
          if (fs.existsSync(path)) {
            const sql = fs.readFileSync(path, { encoding: 'utf8' });
            await t.context.pool.query(sql);
          } else {
            console.warn(`Failed to execute ${path}`);
          }
        } else {
          const { cls, args } = source;
          const generator = new cls(t.context.pool, ...(args || []));
          await generator.run();
        }
      }

      // update serial indexes in all tables
      const wrapSql = fs.readFileSync(`${fixturesFolder}/wrap.sql`, { encoding: 'utf8' });
      const wrapRes = await t.context.pool.query(wrapSql);
      for (const { query } of wrapRes.rows) {
        await t.context.pool.query(query);
      }

      await t.context.pool.query('COMMIT');
    } catch (e) {
      await t.context.pool.query('ROLLBACK');
      console.error(e);
    }
  });

  test.serial.after.always(async (t) => {
    t.context.pool.release();
    await t.context.pg.down();
    t.log(`DROP DATABASE ${config.database}`);
    await t.context.pgAdmin.getClient().query(`DROP DATABASE ${config.database}`);
    await t.context.pgAdmin.down();
    process.env.APP_POSTGRES_URL = t.context.config.pgConnectionString;
    t.log('Cleaned up');
  });

  return { test };
}
