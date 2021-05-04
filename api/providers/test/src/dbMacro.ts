import { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { Database } from './database/Database';

interface TestConfig {
  connectionString: string;
}

export interface MacroTestContext {
  db: Database;
  connection: PostgresConnection;
}

export function dbMacro<TestContext = unknown>(
  anyTest: TestInterface,
  cfg: TestConfig,
): { test: TestInterface<TestContext & MacroTestContext> } {
  const test = anyTest as TestInterface<TestContext & MacroTestContext>;

  test.serial.before(async (t) => {
    t.context.db = new Database(cfg.connectionString);
    await t.context.db.create();
    await t.context.db.migrate();
    await t.context.db.seed();
    t.context.connection = t.context.db.connection;
  });

  test.serial.after.always(async (t) => {
    await t.context.db.drop();
  });

  return { test };
}
