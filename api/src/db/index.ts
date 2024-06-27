import { PgClient, PgPool, readdir, readFile } from "@/deps.ts";
import { buildMigrator } from "@/etl/index.ts";
import { env_or_false } from "@/lib/env/index.ts";
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
  await client.queryArray(
    `CREATE TABLE IF NOT EXISTS migrations (id serial PRIMARY KEY, name varchar NOT NULL, run_on TIMESTAMP NOT NULL)`,
  );
}

async function getDoneMigrations(client: PgClient): Promise<Set<string>> {
  const result = await client.queryObject<{ name: string }>(
    `SELECT name FROM migrations`,
  );
  return new Set(result.rows.map((r) => r.name));
}

async function runMigrations(config: string) {
  const pool = new PgPool(config, 20);
  const conn = await pool.connect();
  await createMigrationTable(conn);
  const possible = await getPossibleMigrationsFilePath();
  const done = await getDoneMigrations(conn);
  const todo = new Set(possible.keys()).difference(done);
  for (const td of todo) {
    const filepath = possible.get(td);
    if (!filepath) {
      continue;
    }
    const sql: string = await readFile(filepath, "utf8");
    const transaction = conn.createTransaction(
      `migration-${td.substring(1)}`,
    );
    await transaction.begin();
    try {
      await transaction.queryArray(sql);
      await transaction.queryArray(
        `INSERT INTO migrations (name, run_on) VALUES ($NAME, NOW())`,
        { NAME: td },
      );
      await transaction.commit();
    } catch (e) {
      console.log(e);
      await transaction.rollback({ chain: true });
    }
  }
  conn.release();
  await pool.end();
}

export async function migrate(config: string, skipDatasets = true) {
  if (!(env_or_false("SKIP_GEO_MIGRATIONS"))) {
    const geoInstance = buildMigrator({
      pool: {
        connectionString: config,
      },
      ...(
        skipDatasets
          ? {
            app: {
              targetSchema: "geo",
              datasets: new Set(),
            },
          }
          : {}
      ),
    });
    await geoInstance.prepare();
    await geoInstance.run();
    await geoInstance.pool.end();
  }
  if (!(env_or_false("SKIP_SQL_MIGRATIONS"))) {
    await runMigrations(config);
  }
}
