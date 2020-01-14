import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import * as templates from '../engine/template';

@command()
export class SeedCommand implements CommandInterface {
  static readonly signature: string = 'policy:seed';
  static readonly description: string = 'Seed template policies';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-f, --fresh',
      description: 'Delete all template before seeding',
    },
    {
      signature: '-u, --database-uri <uri>',
      description: 'Connection string to the database',
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  readonly table = 'policy.policies';

  public async call(options: { fresh: boolean; databaseUri: string }): Promise<string> {
    const { fresh, databaseUri } = options;

    if (!databaseUri) {
      return 'You must specify a database uri';
    }

    const connection = new PostgresConnection({
      connectionString: databaseUri,
    });

    await connection.up();

    const client = await connection.getClient().connect();

    if (fresh) {
      await client.query({
        text: `DELETE FROM ${this.table} WHERE status::varchar = $1 AND parent_id IS NULL`,
        values: ['template'],
      });
    }

    const templatesData = Object.values(templates);
    for (const data of templatesData) {
      const query = {
        text: `
          INSERT INTO ${this.table} (
            parent_id,
            territory_id,
            start_date,
            end_date,
            name,
            slug,
            description,
            unit,
            status,
            global_rules,
            rules,
            ui_status
          ) VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11,
            $12
          )
          ON CONFLICT DO NOTHING
        `,
        values: [
          null,
          null,
          null,
          null,
          data.name,
          data.slug,
          data.description,
          data.unit,
          'template',
          JSON.stringify(data.global_rules),
          JSON.stringify(data.rules),
          JSON.stringify('ui_status' in data ? data.ui_status : {}),
        ],
      };
      await client.query(query);
    }

    await client.release();
    await connection.down();
    return 'Done!';
  }
}
