import { readdirAsync } from "@/deps.ts";
import { extname } from "@/deps.ts";
import { join } from "@/deps.ts";
import { readFileSync } from "@/deps.ts";
import { PgPool } from "@/deps.ts";
import { PgClient } from "@/deps.ts";

const __dirname = import.meta.dirname;

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

async function getDoneMigrations(client: PgClient): Promise<Set<string>> {
  const result = await client.queryObject<{ name: string }>(
    `SELECT name FROM migrations`,
  );
  return new Set(result.rows.map((r) => r.name));
}

export async function migrate(connectionString: string) {
  const pool = new PgPool(connectionString, 20);
  const conn = await pool.connect();
  const possible = await getPossibleMigrationsFilePath();
  const done = await getDoneMigrations(conn);
  const todo = new Set(possible.keys()).difference(done);
  for (const td of todo) {
    const filepath = possible.get(td);
    if (!filepath) {
      continue;
    }
    const transaction = conn.createTransaction(`migration-${td}`);
    await transaction.begin();
    try {
      const sql = readFileSync(filepath, "utf8");
      await transaction.queryArray(sql);
      await transaction.queryArray(
        `INSERT INTO migrations (name, run_on) VALUES ($NAME, NOW())`,
        { NAME: td },
      );
      await transaction.commit();
    } catch {
      await transaction.rollback({ chain: true });
    }
  }
  conn.release();
}
