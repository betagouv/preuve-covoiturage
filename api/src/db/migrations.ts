import { PgClient, PgPool, readdir } from "@/deps.ts";
import { env_or_false } from "@/lib/env/index.ts";
import { readTextFile } from "@/lib/file/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { extname, join } from "@/lib/path/index.ts";

const __dirname = import.meta.dirname || "";

async function getPossibleMigrationsFilePath(): Promise<Map<string, string>> {
  const files = await readdir(join(__dirname, "migrations"));
  return new Map(
    files.filter((f: string) => extname(f) === ".sql").map((
      f: string,
    ) => [
      `/${f.substring(0, f.length - 4)}`,
      join(__dirname, "migrations", f),
    ]),
  );
}

async function createMigrationTable(client: PgClient) {
  await client.queryArray`
    CREATE TABLE IF NOT EXISTS migrations
    (id serial PRIMARY KEY, name varchar NOT NULL, run_on TIMESTAMP NOT NULL)
  `;
}

async function getDoneMigrations(client: PgClient): Promise<Set<string>> {
  const result = await client.queryObject<{ name: string }>`SELECT name FROM migrations`;
  return new Set(result.rows.map((r) => r.name));
}

async function runMigrations(config: string) {
  const pool = new PgPool(config, 20);
  const conn = await pool.connect();

  try {
    await createMigrationTable(conn);

    const possible = await getPossibleMigrationsFilePath();
    const done = await getDoneMigrations(conn);
    const todo = [...new Set(possible.keys()).difference(done).values()].sort();

    for (const td of todo) {
      const filepath = possible.get(td);
      if (!filepath) {
        continue;
      }

      const statements: string = await readTextFile(filepath);
      const transaction = conn.createTransaction(`migration-${td.substring(1)}`);
      await transaction.begin();

      try {
        logger.info(`RUN ${td}`);
        await transaction.queryArray(statements);
        await transaction.queryArray`INSERT INTO public.migrations (name, run_on) VALUES (${td}, NOW())`;
        await transaction.commit();
      } catch (e) {
        // migration is rollbacked if an error occurs !
        // There's no way to catch the database error to log it.
        // Run the file with psql to debug...
        logger.error(`Error in migration: ${td}`);
        logger.error(e.message);
      }
    }
  } finally {
    conn.release();
    await pool.end();
  }
}

export async function migrateSQL(config: string) {
  if (env_or_false("SKIP_SQL_MIGRATIONS")) {
    logger.warn("Skipping SQL migrations");
    return;
  }

  await runMigrations(config);
}
