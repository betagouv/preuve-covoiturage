import path from 'path';

import { Kernel as ParentKernel } from '@ilos/framework';
import { kernel } from '@ilos/common';

import { ServiceProvider } from '../../src/ServiceProvider';
import { AbstractQueryCheck } from '../../src/engine/AbstractQueryCheck';
import { StaticCheckInterface, CheckInterface } from '../../src/interfaces/CheckInterface';
import { PostgresConnection } from '@ilos/connection-postgres/dist';

const configDir = process.env.APP_CONFIG_DIR ? process.env.APP_CONFIG_DIR : './config';
process.env.APP_CONFIG_DIR = path.join( '..', 'dist', configDir);
process.env.APP_ENV = 'testing';

interface FakeDataInterface {
  created_at: Date;
  acquisition_id: number;
  operator_id: string;
  trip_id: string;
  operator_trip_id: string;
  is_driver: boolean;
  operator_class: string;
  datetime: Date;
  duration: number;
  start_position: {
    lat: number;
    lon: number;
  };
  start_insee: string;
  start_town: string;
  start_territory: string;
  end_position: {
    lat: number;
    lon: number;
  };
  end_insee: string;
  end_town: string;
  end_territory: string;
  distance:number;
  seats: number;
};

const defaultData: FakeDataInterface = {
  created_at: new Date(),
  acquisition_id: 1,
  operator_id: 'my_operator',
  trip_id: 'trip_id',
  operator_trip_id: 'operator_trip_id',
  is_driver: false,
  operator_class: 'B',
  datetime: new Date(),
  duration: 100,
  start_position: {
    lat: 48.851047,
    lon: 2.309339,
  },
  start_insee: 'A',
  start_town: 'A',
  start_territory: 'A',
  end_position: {
    lat: 48.847218,
    lon: 2.305447,
  },
  end_insee: 'A',
  end_town: 'A',
  end_territory: 'A',
  distance: 100,
  seats: 1,
};

@kernel({
  children: [ServiceProvider],
})
class Kernel extends ParentKernel {}

export const faker = {
  kernel: null,
  connection: null,
  async up() {
    this.kernel = new Kernel();
    await this.kernel.bootstrap();
    this.connection = this.kernel.get(ServiceProvider).get(PostgresConnection).getClient();
    await this.connection.query(`
      CREATE TABLE IF NOT EXISTS fraud_test_table (
        _id serial primary key,
        created_at timestamp DEFAULT NOW(),
        acquisition_id varchar,
        operator_id varchar,
        trip_id varchar,
        operator_trip_id varchar,
        is_driver boolean,
        operator_class char,
        datetime timestamp with time zone,
        duration int,
        start_position geography,
        start_insee varchar,
        start_town varchar,
        start_territory varchar,
        end_position geography,
        end_insee varchar,
        end_town varchar,
        end_territory varchar,
        distance int,
        seats int default 1
      )
    `);
  },
  async clean() {
    if (this.connection) {
      await this.connection.query(`
      DELETE FROM fraud_test_table
      `);
    }
  },
  async down() {
    if (this.connection) {
      await this.connection.query(`
      DROP TABLE fraud_test_table
      `);
    }
    if (this.kernel) {
      await this.kernel.shutdown();
    }
  },
  get(checkctor: StaticCheckInterface): AbstractQueryCheck {
    return this.kernel.get(ServiceProvider).get(checkctor);
  },
  async setData(check: AbstractQueryCheck, customData: Partial<FakeDataInterface> = {}): Promise<FakeDataInterface> {
    const data: FakeDataInterface = {
      ...defaultData,
      ...customData,
    };
    await this.connection.query({
      text: `
        INSERT INTO fraud_test_table (
          created_at,
          acquisition_id,
          operator_id,
          trip_id,
          operator_trip_id,
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
          seats
        ) VALUES (
          $1::timestamp,
          $2::varchar,
          $3::varchar,
          $4::varchar,
          $5::varchar,
          $6::boolean,
          $7::char,
          $8::timestamp,
          $9::int,
          $10::geography,
          $11::varchar,
          $12::varchar,
          $13::varchar,
          $14::geography,
          $15::varchar,
          $16::varchar,
          $17::varchar,
          $18::int,
          $19::int
        )
      `,
      values: [
        data.created_at.toISOString(),
        data.acquisition_id,
        data.operator_id,
        data.trip_id,
        data.operator_trip_id,
        data.is_driver,
        data.operator_class,
        data.datetime.toISOString(),
        data.duration,
        `POINT(${data.start_position.lon} ${data.start_position.lat})`,
        data.start_insee,
        data.start_town,
        data.start_territory,
        `POINT(${data.end_position.lon} ${data.end_position.lat})`,
        data.end_insee,
        data.end_town,
        data.end_territory,
        data.distance,
        data.seats,
      ],
    });

    check.carpoolView = 'fraud_test_table';

    return data;
  },
}
