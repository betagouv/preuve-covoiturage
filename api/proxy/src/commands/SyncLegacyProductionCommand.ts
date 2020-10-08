import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

type Acquisition = {
  _id: number;
  created_at: Date;
  application_id: number;
  operator_id: number;
  journey_id: string;
  payload: object;
};

@command()
export class SyncLegacyProductionCommand implements CommandInterface {
  static readonly signature: string = 'sync:legacy';
  static readonly description: string = 'sync legacy production acquisition table';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Postgres connection string for writing',
      default: process.env.APP_POSTGRES_URL,
    },
    {
      signature: '-z, --legacy-uri <uri>',
      description: 'Postgres legacy connection string for reading',
      default: process.env.APP_POSTGRES_LEGACY_URL,
    },
    {
      signature: '-f, --from <date>',
      description: 'Sync acquisition from this date',
      coerce: (s: string): Date => new Date(s),
    },
  ];

  public async call(options: { databaseUri: string; legacyUri: string; from: Date }): Promise<string> {
    const pgConRead = new PostgresConnection({ connectionString: options.legacyUri });
    const pgConWrite = new PostgresConnection({ connectionString: options.databaseUri });
    await pgConRead.up();
    await pgConWrite.up();
    const pgRead = pgConRead.getClient();
    const pgWrite = pgConWrite.getClient();

    // define date
    if (!options.from) {
      const resLatest = await pgWrite.query(`
      SELECT created_at FROM acquisition.acquisitions ORDER BY created_at DESC LIMIT 1
    `);
      options.from = resLatest.rows[0].created_at;
    }

    console.log(`> Latest acquisition on new db is: ${options.from.toISOString()}`);

    // count acquisitions to import
    const resAcquisitions = await pgRead.query({
      text: `SELECT * FROM acquisition.acquisitions WHERE created_at > $1`,
      values: [options.from],
    });

    console.log(`> ${resAcquisitions.rowCount} acquisitions to import`);

    let counter = 0;

    if (resAcquisitions.rowCount > 0) {
      try {
        await pgWrite.query('BEGIN');

        for (const line of resAcquisitions.rows as Acquisition[]) {
          await pgWrite.query({
            text: `
            INSERT INTO acquisition.acquisitions (
              application_id,
              operator_id,
              journey_id,
              payload
            ) VALUES ( $1, $2, $3, $4 )
            ON CONFLICT DO NOTHING
          `,
            values: [line.application_id, line.operator_id, line.journey_id, line.payload],
          });

          counter += 1;
          console.log(`>>> Imported ${line._id}\t${line.created_at.toISOString()}`);
        }

        await pgWrite.query('COMMIT');
      } catch (e) {
        console.log(e);
        await pgWrite.query('ROLLBACK');
      }
    }

    return `> Imported ${counter} acquisitions into DB`;
  }
}
