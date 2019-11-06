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

  public async call(options): Promise<void> {
    try {
      const pg = new PostgresConnection({
        connectionString: options.databaseUri,
      });
      await pg.up();
      const pgClient = pg.getClient();

      // reset all users' permissions based on config
      const perms: PermsConfig = this.config.get('permissions');
      const updates = [];
      Object.keys(perms).forEach((group: string) => {
        Object.values(perms[group]).forEach(({ slug: role, permissions }) => {
          console.log(`[set-permissions] ${group}:${role}`);
          updates.push(
            pgClient.query({
              text: `UPDATE ${this.table} SET permissions=$1 WHERE slug=$2`,
              values: [[...new Set(permissions)], `${group}.${role}`],
            }),
          );
        });
      });

      await Promise.all(updates);
      console.log('[set-permissions] All patched!');
    } catch (e) {
      console.log('[set-permissions] ERROR', e.message);
    }
  }
}
