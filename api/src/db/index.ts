import { process, readdirAsync } from "@/deps.ts";
import { extname } from "@/deps.ts";
import { join } from "@/deps.ts";
import { readFileSync } from "@/deps.ts";
import { PgPool } from "@/deps.ts";
import { PgClient } from "@/deps.ts";
import { buildMigrator } from "@/etl/index.ts";

const __dirname = import.meta.dirname || "";

async function getPossibleMigrationsFilePath(): Promise<Map<string, string>> {
  const files = await readdirAsync(join(__dirname, "migrations"));
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
    const sql: string = readFileSync(filepath, "utf8");
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
      console.log(e, config);
      await transaction.rollback({ chain: true });
    }
  }
  conn.release();
  await pool.end();
}

export async function migrate(config: string, skipDatasets = true) {
  if (!("SKIP_GEO_MIGRATIONS" in process.env)) {
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
  if (!("SKIP_SQL_MIGRATIONS" in process.env)) {
    await runMigrations(config);
  }
}
