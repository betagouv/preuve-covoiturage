import { command, CommandInterface, CommandOptionType, ConfigInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

// The config object returned from permissions.ts
interface PermsConfig {
  group: {
    role: {
      slug: string;
      name: string;
      permissions: string[];
    };
  };
}

@command()
export class SetPermissionsCommand implements CommandInterface {
  static readonly signature: string = 'set-permissions';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Postgres connection string',
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  // roles' table
  private readonly table = 'common.roles';

  constructor(private config: ConfigInterfaceResolver) {}

  public async call(options): Promise<string> {
    let pg;
    let pgClient;
    try {
      pg = new PostgresConnection({ connectionString: options.databaseUri });
      await pg.up();
      pgClient = await pg.getClient().connect();

      // reset all users' permissions based on config
      const perms: PermsConfig = this.config.get('permissions');
      const updates = [];

      await pgClient.query('BEGIN');

      // clean up the table
      await pgClient.query(`DELETE FROM ${this.table}`);
      console.log('[set-permissions] table cleaned up');

      // insert permissions
      Object.keys(perms).forEach((group: string) => {
        Object.values(perms[group]).forEach(({ slug: role, permissions }) => {
          const description = group.substr(0, 1).toUpperCase() + group.substr(1) + ` ${role}`;

          console.log(`[set-permissions] ${group}:${role} (${description})`);

          updates.push(
            pgClient.query({
              text: `INSERT INTO ${this.table} VALUES ($1, $2, $3)`,
              values: [`${group}.${role}`, description, [...new Set(permissions)]],
            }),
          );
        });
      });

      await Promise.all(updates);

      await pgClient.query('COMMIT');

      console.log('[set-permissions] All patched!');
    } catch (e) {
      if ('query' in pgClient) pgClient.query('ROLLBACK');

      console.log('[set-permissions] ERROR', e.message);
    }

    pgClient.release();
    await pg.down();

    return '';
  }
}
