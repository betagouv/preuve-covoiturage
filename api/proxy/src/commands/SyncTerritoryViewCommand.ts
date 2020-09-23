/* eslint-disable no-constant-condition, max-len */
import { promisify } from 'util';
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

@command()
export class SyncTerritoryViewCommand implements CommandInterface {
  static readonly signature: string = 'sync:territory_view';
  static readonly description: string = 'sync territory view';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Postgres connection string',
      default: process.env.APP_POSTGRES_URL,
    },
    {
      signature: '-a, --all',
      description: 'Sync all territories',
      default: false,
    },
  ];

  protected readonly allQuery = 'SELECT _id FROM territory.territories ORDER BY _id';
  protected readonly scopedQuery = 'SELECT t._id FROM territory.territories as t LEFT JOIN territory.territories_view as v on t._id = v._id WHERE v._id IS NULL ORDER BY t._id';

  // tslint:disable-next-line: no-shadowed-variable
  public async call(options): Promise<string> {
    console.log('Syncing territories view');
    const pgConnection = new PostgresConnection({
      connectionString: options.databaseUri,
    });

    await pgConnection.up();
    const pgClient = pgConnection.getClient();
    const pgConnected = await pgClient.connect();
    const cursorCb = pgConnected.query(new Cursor(options.all ? this.allQuery : this.scopedQuery));
    const cursor = promisify(cursorCb.read.bind(cursorCb));
    const ROW_COUNT = 20;
    let count = 0;
    let batch = 1;
    do {
      const results = await cursor(ROW_COUNT);
      count = results.length;
      const _ids = results.map(r => r._id);
      await pgConnection.getClient().query({
        text: `
          INSERT INTO
            territory.territories_view
          SELECT * FROM territory.get_data($1::int[]) ON CONFLICT (_id)
          DO UPDATE
            SET (
              parents,
              children,
              ancestors,
              descendants,
              active,
              activable,
              level,
              insee,
              postcode,
              codedep,
              breadcrumb
            ) = (
              excluded.parents,
              excluded.children,
              excluded.ancestors,
              excluded.descendants,
              excluded.active,
              excluded.activable,
              excluded.level,
              excluded.insee,
              excluded.postcode,
              excluded.codedep,
              excluded.breadcrumb
            );
        `,
        values: [_ids],
      });
      console.log(`Batch ${batch} done`);
      batch += 1;
    } while (count !== 0);

    return 'ok';
  }
}
