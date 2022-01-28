import fs from 'fs';
import path from 'path';

import { NewableType } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { uuid } from './helpers';
import { Generator } from './fixtures/generators/Generator';
import { IdentityGenerator } from './fixtures/generators/IdentityGenerator';
import { TripGenerator } from './fixtures/generators/TripGenerator';
import { identities } from './fixtures/identities';

interface FixtureConfig {
  fixturePath: string;
  fixtureSources: (string | { cls: NewableType<Generator<unknown>>; args?: any[] })[];
}

interface DbConfig {
  pgConnectionString: string;
  database: string;
}

export type BeforeConfigInterface = FixtureConfig & DbConfig;

interface AfterConfigInterface {
  database: string;
  tmpConnection: PostgresConnection;
  adminConnection: PostgresConnection;
  adminConnectionString: string;
  tmpConnectionString?: string;
}

export interface DbContextInterface extends AfterConfigInterface {
  tmpConnectionString: string;
}

function getConfig(cfg: Partial<BeforeConfigInterface>): BeforeConfigInterface {
  return {
    fixturePath: path.join(__dirname, 'fixtures'),
    /**
     * list all fixtures by their filename (without .sql extension)
     * - order of the array is respected
     * - /!\ schemas.sql is always called before the fixtures
     * - the test can override this array by passing { sources: [] } to the config.
     *   watch out for broken relationships if you do that!
     */
    fixtureSources: [
      'roles',
      'users',
      'companies',
      'operators',
      'territories',
      { cls: IdentityGenerator },
      { cls: TripGenerator, args: [{ identities, inserts: 100 }] },
    ],
    pgConnectionString: process.env.APP_POSTGRES_URL,
    database: `fixtures_${uuid().replace(/-/g, '_')}`,
    ...cfg,
  };
}

export async function dbBeforeMacro(
  cfg: Partial<BeforeConfigInterface> = {},
): Promise<DbContextInterface> {
  const config = getConfig(cfg); 
  // create database with admin connection
  const adminConnection = new PostgresConnection({ connectionString: config.pgConnectionString });
  await adminConnection.getClient().query(`CREATE DATABASE ${config.database}`);
  console.debug(`Create database ${config.database}`);

  // create a connection and a pool for the client with this database
  const tmpConnectionString = config.pgConnectionString.replace(/\/[a-z_\-0-9]+$/i, `/${config.database}`);
  const tmpConnection = new PostgresConnection({ connectionString: tmpConnectionString });
  const pool = await tmpConnection.getClient().connect();
  try {
    // flash schemas
    console.debug('Fixtures folder', config.fixturePath);

    if (!fs.existsSync(`${config.fixturePath}/schemas.sql`)) throw new Error('schemas.sql file not found');
    const schemasSql = fs.readFileSync(`${config.fixturePath}/schemas.sql`, { encoding: 'utf8' });

    console.debug('Create schemas');
    await pool.query(schemasSql);

    await pool.query('BEGIN');
    // flash data
    for (const source of config.fixtureSources) {
      if (typeof source === 'string') {
        const fixturePath = path.join(config.fixturePath, `${source}.sql`);
        console.debug(`Flash ${fixturePath}`);
        if (fs.existsSync(fixturePath)) {
          const sql = fs.readFileSync(fixturePath, { encoding: 'utf8' });
          await pool.query(sql);
        } else {
          console.warn(`Failed to execute ${path}`);
        }
      } else {
        const { cls, args } = source;
        const generator = new cls(pool, ...(args || []));
        await generator.run();
      }
    }

    // update serial indexes in all tables
    const wrapSql = fs.readFileSync(`${config.fixturePath}/wrap.sql`, { encoding: 'utf8' });
    const wrapRes = await pool.query(wrapSql);
    for (const { query } of wrapRes.rows) {
      await pool.query(query);
    }
    await pool.query('COMMIT');
    process.env.APP_POSTGRES_URL = tmpConnectionString;
    return {
      database: config.database,
      tmpConnectionString,
      tmpConnection,
      adminConnection,
      adminConnectionString: config.pgConnectionString,
    };
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error(e.message, e);
    throw e;
  } finally {
    pool.release();
  }
}

export async function dbAfterMacro(cfg: AfterConfigInterface): Promise<void> {
  await cfg.tmpConnection.down();
  console.debug(`DROP DATABASE ${cfg.database}`);
  await cfg.adminConnection.getClient().query(`DROP DATABASE ${cfg.database}`);
  await cfg.adminConnection.down();
  process.env.APP_POSTGRES_URL = cfg.adminConnectionString;
  console.debug('Cleaned up');
} 
