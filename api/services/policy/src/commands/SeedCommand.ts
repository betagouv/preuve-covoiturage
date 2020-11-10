import { map, difference, sortedUniq } from 'lodash';
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';

import { rules } from '../engine/rules';
import * as templates from '../engine/templates';

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

  private connection: PostgresConnection;
  private pgClient: PoolClient;

  public async call(options: { fresh: boolean; databaseUri: string }): Promise<string> {
    const { fresh, databaseUri } = options;

    await this.connectDb(databaseUri);

    if (fresh) {
      await this.pgClient.query({
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
      await this.pgClient.query(query);
    }
    console.log('> Policy templates seeded');

    await this.checkTemplateSlugs();

    await this.disconnectDb();

    return '';
  }

  /**
   * check all rules defined in the saved templates to find
   * the ones with undefined slugs
   */
  private async checkTemplateSlugs(): Promise<void> {
    /* eslint-disable */
    const results = await this.pgClient.query(`
      SELECT _id, slug, array_agg(gr) || array_agg(r) AS rules
      FROM policy.policies pp,
      LATERAL (SELECT json_array_elements(global_rules)::json->>'slug' FROM policy.policies ppg WHERE pp._id=ppg._id) as gr,
      LATERAL (SELECT json_array_elements(json_array_elements(rules))::json->>'slug' FROM policy.policies ppr WHERE pp._id=ppr._id) as r
      WHERE status = 'template'
      GROUP BY _id, slug
    `);
    /* eslint-enable */

    for (const template of results.rows) {
      const diff = difference(
        sortedUniq(
          template.rules
            .replace(/[^a-z_,]/g, '')
            .split(',')
            .sort(),
        ),
        map(rules, 'slug'),
      );

      if (diff.length) {
        console.log(`\n> Unrecognized rules for template #${template._id} "${template.slug}":`);
        console.log(diff);
      }
    }
  }

  private async connectDb(uri: string): Promise<void> {
    if (!uri) {
      throw new Error('You must specify a database uri');
    }

    this.connection = new PostgresConnection({ connectionString: uri });
    await this.connection.up();
    this.pgClient = await this.connection.getClient().connect();
  }

  private async disconnectDb(): Promise<void> {
    await this.pgClient.release();
    await this.connection.down();
  }
}
