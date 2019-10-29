import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { promisify } from 'util';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

@command()
export class MigrateDataCommand implements CommandInterface {
  static readonly signature: string = 'migrate-data:trip';
  static readonly description: string = 'Migrate data from old table to new table';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Connection string to the database',
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  // tslint:disable-next-line: no-shadowed-variable
  public async call(options): Promise<string> {
    const connection = new PostgresConnection({
      connectionString: options.databaseUri,
    });

    const writeconnection = new PostgresConnection({
      connectionString: options.databaseUri,
    });

    await connection.up();
    await writeconnection.up();

    const client = connection.getClient();
    const writeclient = writeconnection.getClient();

    const cursor = client.query(
      new Cursor(
        `select
        trips.created_at as created_at,
        trips.operator_trip_id as operator_trip_id,
        trip_participants.trip_id as trip_id,
        trip_participants.operator_id as operator_id,
        trip_participants.journey_id as acquisition_id,
        trip_participants.operator_class as operator_class,
        trip_participants.identity as identity,
        trip_participants.is_driver as is_driver,
        trip_participants.start_datetime as datetime,
        trip_participants.start_position as start_position,
        trip_participants.start_insee as start_insee,
        trip_participants.start_town as start_town,
        trip_participants.start_territory as start_territory,
        trip_participants.end_position as end_position,
        trip_participants.end_insee as end_insee,
        trip_participants.end_town as end_town,
        trip_participants.end_territory as end_territory,
        trip_participants.distance as distance,
        trip_participants.duration as duration,
        trip_participants.seats as seats,
        EXTRACT(EPOCH FROM (trip_participants.end_datetime::timestamp - trip_participants.start_datetime::timestamp)) as calc_duration
      from trip_participants
      left join trips on trip_participants.trip_id = trips._id`,
        [],
      ),
    );

    const promisifiedCursorRead = promisify(cursor.read.bind(cursor));
    const ROW_COUNT = 10;
    let count = 0;

    do {
      const result = await promisifiedCursorRead(ROW_COUNT);
      count = result.length;
      for (const line of result) {
        await writeclient.query({
          text: `INSERT INTO carpool.carpools (
            acquisition_id,
            operator_id,
            trip_id,
            identity,
            is_driver,
            operator_class,
            datetime,
            duration,
            start_position,
            start_insee,
            start_town,
            start_territory,
            end_position,
            end_insee,
            end_town,
            end_territory,
            distance,
            seats,
            created_at,
            operator_trip_id
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
            $12,
            $13,
            $14,
            $15,
            $16,
            $17,
            $18,
            $19,
            $20
          )`,
          values: [
            line.acquisition_id,
            line.operator_id,
            line.trip_id,
            line.identity,
            line.is_driver,
            line.operator_class,
            line.datetime,
            line.duration,
            line.start_position,
            line.start_insee,
            line.start_town,
            line.start_territory,
            line.end_position,
            line.end_insee,
            line.end_town,
            line.end_territory,
            line.distance,
            line.seats,
            line.created_at,
            line.operator_trip_id,
          ],
        });
      }
    } while (count !== 0);

    return 'Done!';
  }
}
