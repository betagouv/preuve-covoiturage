import { Client } from "dep:postgres";

// Get connection string from environment variable
const connectionString = Deno.args[0] || Deno.env.get("APP_POSTGRES_URL");
if (!connectionString) {
  console.error("APP_POSTGRES_URL environment variable or 1st CLI argument is not set.");
  Deno.exit(1);
}

const client = new Client(connectionString);

try {
  // List all databases starting with 'test_'
  const res = await client.queryObject<{ datname: string }>(
    `SELECT datname FROM pg_database WHERE datname LIKE 'test\\_%' ESCAPE '\\';`,
  );

  for (const db of res.rows.map((row) => row.datname)) {
    await client.queryArray`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ${db}`;
    await client.queryArray(`DROP DATABASE IF EXISTS ${db}`);
    console.log(`  - Dropped database: ${db}`);
  }
} catch (err) {
  console.error("Error:", Error.isError(err) ? err.message : err);
} finally {
  await client.end();
}
