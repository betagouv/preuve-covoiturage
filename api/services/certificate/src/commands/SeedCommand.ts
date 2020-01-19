import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

interface CommandOptions {
  databaseUri: string;
  number: number;
  driver: string;
  passenger: string;
}

@command()
export class SeedCommand implements CommandInterface {
  private db;

  static readonly signature: string = 'seed';
  static readonly description: string = 'Seed fake identities, carpools and policies to fill out certificates';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Postgres connection string',
      default: process.env.APP_POSTGRES_URL,
    },
    {
      signature: '-n, --number <number>',
      description: 'Number of carpools to seed',
      default: 1000,
      coerce: (s: string): number => Number(s),
    },
    {
      signature: '-d, --driver <phone>',
      description: 'Driver phone number',
      default: '+33612345678',
    },
    {
      signature: '-p, --passenger <phone>',
      description: 'Passenger phone number',
      default: '+33687654321',
    },
  ];

  public async call(options: CommandOptions): Promise<string> {
    // connect DB
    const postgres = new PostgresConnection({ connectionString: options.databaseUri });
    await postgres.up();
    this.db = postgres.getClient();

    // 1. créer une identité dans carpool.identities
    // 2. créer un carpool.carpools avec identity_id
    // 3. créer une policy.incentives avec le carpool_id et un amount ~ 180

    try {
      await this.db.query('BEGIN');

      // Create driver and passenger identities
      const driver = await this.upsertIdentity(options.driver);
      console.log(`> upserted driver: ${driver._id}`);

      const passenger = await this.upsertIdentity(options.passenger);
      console.log(`> upserted passenger: ${passenger._id}`);

      for (let i = 0; i < options.number; i++) {
        const cpD = await this.fakeCarpool(driver._id, true);
        console.log(`> inserted carpool driver: ${cpD._id}`);

        const cpP = await this.fakeCarpool(passenger._id, true);
        console.log(`> inserted carpool passenger: ${cpP._id}`);

        await this.fakeIncentive(cpD._id);
        await this.fakeIncentive(cpP._id);
        console.log('inserted incentives');
      }

      await this.db.query('COMMIT');

      return 'Done!';
    } catch (e) {
      console.log('Failed to seed identities, carpools and incentives for certificates');
      console.log(e.message);
      await this.db.query('ROLLBACK');
    }
  }

  private async upsertIdentity(id: string): Promise<{ _id: number }> {
    const result = await this.db.query({
      text: `SELECT _id FROM carpool.identities WHERE phone = $1 LIMIT 1;`,
      values: [id],
    });

    if (result.rowCount > 0) return result.rows[0];

    const created = await this.db.query({
      text: ` INSERT INTO carpool.identities ( phone, over_18 ) VALUES ( $1, $2 ) RETURNING _id`,
      values: [id, true],
    });

    if (created.rowCount === 0) throw new Error(`Failed to create identity: ${id}`);

    return created.rows[0];
  }

  private async fakeCarpool(identity_id: number, is_driver: boolean): Promise<any> {
    const result = await this.db.query({
      text: `
        INSERT INTO carpool.carpools
        ( is_driver, distance, identity_id )
        VALUES ( $1, $2, $3 )
        RETURNING *
      `,
      values: [is_driver, (Math.random() * 100000) | 0, identity_id],
    });

    return result.rows[0];
  }

  private async fakeIncentive(carpool_id: number): Promise<void> {
    await this.db.query({
      text: `
        INSERT INTO policy.incentives
        ( policy_id, status, carpool_id, amount )
        VALUES ( $1, $2, $3::varchar, $4 )
      `,
      values: [1, 'validated', carpool_id, (Math.random() * 200) | 0],
    });
  }
}
