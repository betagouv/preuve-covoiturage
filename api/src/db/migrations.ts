import { PgClient, pgjs, readdir } from "@/deps.ts";
import { env_or_false } from "@/lib/env/index.ts";
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
  await client.queryArray(`
    CREATE TABLE IF NOT EXISTS migrations
    (
      id serial PRIMARY KEY,
      name varchar NOT NULL,
      run_on TIMESTAMP NOT NULL
    )
  `);
}

async function getDoneMigrations(client: PgClient): Promise<Set<string>> {
  const result = await client.queryObject<{ name: string }>(
    `SELECT name FROM migrations`,
  );
  return new Set(result.rows.map((r) => r.name));
}

async function runMigrations(config: string) {
  const sql = pgjs(config);

  // const pool = new PgPool(config, 20);
  // const client = await pool.connect();

  // await createMigrationTable(client);

  const possible = await getPossibleMigrationsFilePath();
  // const done = await getDoneMigrations(client);
  // const migrations = [...new Set(possible.keys()).difference(done).values()].sort();
  const migrations = [...possible.keys()].sort();

  let i = 0;
  for (const name of migrations) {
    i++;
    if (i > 1) {
      break;
    }

    const filepath = possible.get(name);
    if (!filepath) {
      continue;
    }

    // const statements: string = await readTextFile(filepath);

    console.log(filepath);
    // await sql.begin((s: any) => [
    await sql.file(filepath);
    await sql`INSERT INTO migrations (name, run_on) VALUES (${name}, NOW())`;
    // ]);

    // const transaction = client.createTransaction(`migration-${td.substring(1)}`, {});
    // await transaction.begin();
    // console.log(`BEGIN migration: ${td} - ${filepath}`);

    // try {
    //   // for (const query of sql.split(";")) {
    //   //   if (query.trim() === "") {
    //   //     continue;
    //   //   }

    //   //   console.log(query);
    //   //   await transaction.queryArray(query);
    //   // }
    //   await transaction.queryArray`${statements}`;

    //   await transaction.queryArray(
    //     `INSERT INTO migrations (name, run_on) VALUES ($NAME, NOW())`,
    //     { NAME: td },
    //   );

    //   await transaction.commit();
    //   console.log(` > COMMIT migration: ${td}`);
    // } catch (e) {
    //   console.log(" > CATCH", e.message);
    //   try {
    //     await transaction.rollback({ chain: false });
    //     console.log(e);
    //     console.log(`ROLLBACK migration: ${td}`);
    //   } catch (e2) {
    //     console.log(" > ROLLBACK FAILED", e2.message);
    //   }
    // }
  }

  console.log("CLOSE CONNECTION");
  sql.end();
  // client.release();
  // await pool.end();
}

export async function migrateSQL(config: string) {
  if (env_or_false("SKIP_SQL_MIGRATIONS")) {
    logger.warn("Skipping SQL migrations");
    return;
  }

  await runMigrations(config);
}
