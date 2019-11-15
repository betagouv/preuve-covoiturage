import path from 'path';

import { Kernel as ParentKernel } from '@ilos/framework';
import { kernel } from '@ilos/common';

import { ServiceProvider } from '../../src/ServiceProvider';
import { AbstractQueryCheck } from '../../src/engine/AbstractQueryCheck';
import { StaticCheckInterface, CheckInterface } from '../../src/interfaces/CheckInterface';

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
  async up() {
    this.kernel = new Kernel();
    await this.kernel.bootstrap();
  },
  async down() {
    if (this.kernel) {
      await this.kernel.shutdown();
    }
  },
  get(checkctor: StaticCheckInterface): AbstractQueryCheck {
    return this.kernel.get(ServiceProvider).get(checkctor);
  },
  setData(check: AbstractQueryCheck, customData: Partial<FakeDataInterface> = {}): FakeDataInterface {
    const data: FakeDataInterface = {
      ...defaultData,
      ...customData,
    };

    check.carpoolView = `(
      SELECT
      '${data.created_at.toISOString()}'::timestamp as created_at,
      '${data.acquisition_id}'::varchar as acquisition_id,
      '${data.operator_id}'::varchar as operator_id,
      '${data.trip_id}'::varchar as trip_id,
      '${data.operator_trip_id}'::varchar as operator_trip_id,
      '${data.is_driver}'::boolean as is_driver,
      '${data.operator_class}'::char as operator_class,
      '${data.datetime.toISOString()}'::timestamp as datetime,
      '${data.duration}'::int as duration,
      'POINT(${data.start_position.lon} ${data.start_position.lat})'::geography as start_position,
      '${data.start_insee}'::varchar as start_insee,
      '${data.start_town}'::varchar as start_town,
      '${data.start_territory}'::varchar as start_territory,
      'POINT(${data.end_position.lon} ${data.end_position.lat})'::geography as end_position,
      '${data.end_insee}'::varchar as end_insee,
      '${data.end_town}'::varchar as end_town,
      '${data.end_territory}'::varchar as end_territory,
      '${data.distance}'::int as distance,
      '${data.seats}'::int as seats
    ) as fake`;

    return data;
  },
}
