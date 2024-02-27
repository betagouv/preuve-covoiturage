import { PostgresConnection } from '@ilos/connection-postgres';
import { Migrator } from '@pdc/providers/seed';

interface Config {
  connectionString: string;
}

export interface DbContext {
  db: Migrator;
  connection: PostgresConnection;
}

export interface DbBeforeAfter {
  before(): Promise<DbContext>;
  after(cfg: DbContext): Promise<void>;
}

export function makeDbBeforeAfter(cfg?: Config): DbBeforeAfter {
  return {
    before: async (): Promise<DbContext> => {
      const connectionString =
        cfg?.connectionString || 'APP_POSTGRES_URL' in process.env
          ? process.env.APP_POSTGRES_URL
          : 'postgresql://postgres:postgres@localhost:5432/local';

      const db = new Migrator(connectionString);
      await db.create();
      await db.migrate();
      await db.seed();
      return {
        db,
        connection: db.connection,
      };
    },
    after: async (ctx: DbContext): Promise<void> => {
      await ctx.db.down();
      await ctx.db.drop();
    },
  };
}
