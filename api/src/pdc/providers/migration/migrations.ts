import { env_or_false } from "@/lib/env/index.ts";
import { readTextFile } from "@/lib/file/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { extname, join } from "@/lib/path/index.ts";
import { readdir } from "dep:fs-promises";
import { Client as PgClient, Pool as PgPool } from "dep:postgres";

export async function migrateSQL(connectionString: string, path: string, verbose = true) {
  if (env_or_false("SKIP_SQL_MIGRATIONS")) {
    logger.warn("Skipping SQL migrations");
    return;
  }

  const pool = new PgPool(connectionString, 20);
  const conn = await pool.connect();

  try {
    await createMigrationTable(conn);

    const possible = await getPossibleMigrationsFilePath(path);
    const done = await getDoneMigrations(conn);
    const todo = [...new Set(possible.keys()).difference(done).values()].sort();

    for (const td of todo) {
      const filepath = possible.get(td);
      if (!filepath) {
        continue;
      }

      const statements: string = await readTextFile(filepath);
      // Connexion dédiée par migration : une migration en échec avortée laisse la
      // connexion dans un état corrompu (deno-postgres) qui casse les migrations
      // suivantes sur la connexion partagée. On isole donc chaque migration.
      const migClient = new PgClient(connectionString);
      await migClient.connect();
      const transaction = migClient.createTransaction(`migration-${td.substring(1)}`);
      await transaction.begin();

      try {
        verbose && logger.info(` - migrate ${td}`);
        await transaction.queryArray(statements);
        await transaction.queryArray`INSERT INTO public.migrations (name, run_on) VALUES (${td}, NOW())`;
        await transaction.commit();
      } catch (e) {
        logger.error(`Error in migration: ${td}`);
        logger.error(migrationErrorMessage(e));
        throw e;
      } finally {
        await migClient.end();
      }
    }
  } catch (e) {
    logger.error("Error in migrateSQL");
    logger.error(migrationErrorMessage(e));
    throw e;
  } finally {
    conn.release();
    await pool.end();
  }
}

// deno-postgres masque l'erreur SQL derrière « transaction has been aborted » : le détail est dans cause.
function migrationErrorMessage(e: unknown): string {
  if (!(e instanceof Error)) return "An unknown error occurred";
  const cause = e.cause instanceof Error ? e.cause.message : undefined;
  return cause ? `${e.message} — ${cause}` : e.message;
}

async function getPossibleMigrationsFilePath(path: string): Promise<Map<string, string>> {
  const p = path.replace("file:", "");
  const files = await readdir(p);

  return new Map(
    files
      .filter((f: string) => extname(f) === ".sql")
      .map((f: string) => [`/${f.substring(0, f.length - 4)}`, join(p, f)]),
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
