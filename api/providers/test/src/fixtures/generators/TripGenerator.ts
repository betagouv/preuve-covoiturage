import { merge, omit, has, set } from 'lodash';
import { v4 as uuid } from 'uuid';
import faker from 'faker/locale/fr';
import { PoolClient } from '@ilos/connection-postgres';

import { Generator } from './Generator';
import { IdentityInterface } from './IdentityGenerator';
import { idAtlantis } from '../id_atlantis';
import { idOlympus } from '../id_olympus';

type Acquisition = {};
type Carpool = {};
type AcquisitionPayload = any;
type Origin = { _id: number; lon: number; lat: number; radius: number };
type Coordinates = { lon: number; lat: number };

export type TripInterface = [Acquisition, Carpool];

export class TripGenerator extends Generator<TripInterface> {
  private acqTable = 'acquisition.acquisitions';
  private carTable = 'carpool.carpools';
  private originAtlantis: Origin = { _id: 1, lat: 47.211165, lon: -1.609713, radius: 10000 };
  private originOlympus: Origin = { _id: 2, lat: 45.644597, lon: 6.015726, radius: 15000 };
  private options: Partial<{
    identities: IdentityInterface[];
    inserts: number;
  }>;

  constructor(protected pool: PoolClient, ...args: any[]) {
    super(pool);
    this.options = merge(
      {
        identities: [],
        inserts: 100,
      },
      args[0],
    );
  }

  async run(): Promise<void> {
    // gen back and forth journeys
    // write to acq
    // write to carpool

    try {
      await this.pool.query('BEGIN');

      let counter = 0;
      while (counter < this.options.inserts) {
        const origin = faker.random.arrayElement([this.originAtlantis, this.originOlympus]);
        const territoryIds = origin._id === 1 ? idAtlantis : idOlympus;
        const { passenger, driver, payload } = this.getTrip(origin);

        const operator_id = faker.random.arrayElement([1, 2]);

        // insert acquisition
        const acq = await this.pool.query({
          text: `
            INSERT INTO ${this.acqTable}
            (application_id, operator_id, journey_id, payload)
            VALUES ($1, $2, $3, $4)
            RETURNING _id
          `,
          values: [operator_id, operator_id, payload.journey_id, payload],
        });

        // insert carpool
        const trip_id = uuid();
        const status = faker.random.arrayElement([
          'ok',
          'ok',
          'ok',
          'ok',
          'ok',
          'ok',
          'ok',
          'ok',
          'ok',
          'ok',
          'ok',
          'ok',
          'expired',
          'canceled',
        ]);

        // passenger
        await this.pool.query({
          text: `
            INSERT INTO ${this.carTable}
            (
              acquisition_id,
              operator_id,
              trip_id,
              operator_trip_id,
              is_driver,
              operator_class,
              datetime,
              duration,
              start_position,
              start_territory_id,
              end_position,
              end_territory_id,
              distance,
              seats,
              identity_id,
              operator_journey_id,
              cost,
              status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          `,
          values: [
            acq.rows[0]._id,
            operator_id,
            trip_id,
            payload.journey_id,
            false,
            payload.operator_class,
            payload.passenger.start.datetime,
            payload.passenger.duration,
            `POINT(${payload.passenger.start.lon} ${payload.passenger.start.lat})`,
            faker.random.arrayElement(territoryIds),
            `POINT(${payload.passenger.end.lon} ${payload.passenger.end.lat})`,
            faker.random.arrayElement(territoryIds),
            payload.passenger.distance,
            1,
            passenger._id,
            payload.operator_journey_id,
            payload.passenger.contribution,
            status,
          ],
        });

        // driver
        await this.pool.query({
          text: `
            INSERT INTO ${this.carTable}
            (
              acquisition_id,
              operator_id,
              trip_id,
              operator_trip_id,
              is_driver,
              operator_class,
              datetime,
              duration,
              start_position,
              start_territory_id,
              end_position,
              end_territory_id,
              distance,
              seats,
              identity_id,
              operator_journey_id,
              cost,
              status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          `,
          values: [
            acq.rows[0]._id,
            operator_id,
            trip_id,
            payload.journey_id,
            true,
            payload.operator_class,
            payload.driver.start.datetime,
            payload.driver.duration,
            `POINT(${payload.driver.start.lon} ${payload.driver.start.lat})`,
            faker.random.arrayElement(territoryIds),
            `POINT(${payload.driver.end.lon} ${payload.driver.end.lat})`,
            faker.random.arrayElement(territoryIds),
            payload.driver.distance,
            1,
            driver._id,
            payload.operator_journey_id,
            payload.driver.revenue,
            status,
          ],
        });

        counter++;
      }
    } catch (e) {
      await this.pool.query('ROLLBACK');
      console.log(`Failed to insert trips`, e.message);
      throw e;
    }

    await this.pool.query('COMMIT');
  }

  private getTrip(
    origin: Origin,
  ): {
    passenger: IdentityInterface;
    driver: IdentityInterface;
    payload: any;
  } {
    const { passenger, driver } = this.getCouple();

    const start = this.getPoint(origin);
    const end = this.getPoint(origin);

    const payload = this.getPayload({
      passenger: { identity: omit(passenger, ['uuid']), start, end },
      driver: { identity: omit(driver, ['uuid']), start, end },
    });

    return { passenger, driver, payload };
  }

  private getPoint(origin: Origin): Coordinates {
    // calculate the number of meters for 1°
    // metersAtLat =  meterAtEquator * cos(lat)
    const metersAtLat = 111200 * Math.cos(origin.lat * (Math.PI / 180));
    const radius = faker.random.number(origin.radius) / metersAtLat;
    const angle = (faker.random.number(360 * 10000) * (Math.PI / 180)) / 10000;

    return {
      lon: origin.lon + radius * Math.cos(angle),
      lat: origin.lat + radius * Math.sin(angle),
    };
  }

  private getCouple(): { passenger: IdentityInterface; driver: IdentityInterface } {
    const identities = [...this.options.identities];
    const passenger = identities.splice(Math.floor(Math.random() * identities.length), 1).pop();
    const driver = identities.splice(Math.floor(Math.random() * identities.length), 1).pop();

    return { passenger, driver };
  }

  private getPayload(payload: Partial<AcquisitionPayload> = {}): AcquisitionPayload {
    const distance = faker.random.number(100000);
    const passengerStart = faker.date.recent(faker.random.number(90));
    const passengerDuration = faker.random.number(7200);
    const driverStart = new Date(passengerStart.getTime() - faker.random.number(1800));
    const driverDuration = passengerDuration + faker.random.number(3600);

    const base = {
      operator_class: faker.random.arrayElement(['A', 'B', 'C']),
      journey_id: uuid(),
      operator_journey_id: uuid(),
      passenger: {
        distance,
        duration: passengerDuration,
        incentives: [],
        contribution: faker.random.number(2000),
        seats: 1 + faker.random.number(7),
        start: {
          datetime: passengerStart,
          lat: 48.77826,
          lon: 2.21223,
        },
        end: {
          datetime: new Date(passengerStart.getTime() + passengerDuration).toISOString(),
          lat: 48.82338,
          lon: 1.78668,
        },
      },
      driver: {
        distance: distance + faker.random.number(10000),
        duration: driverDuration,
        incentives: [],
        revenue: faker.random.number(2000),
        start: {
          datetime: driverStart,
          lat: 48.77826,
          lon: 2.21223,
        },
        end: {
          datetime: new Date(driverStart.getTime() + driverDuration).toISOString(),
          lat: 48.82338,
          lon: 1.78668,
        },
      },
    };

    if (!has(payload, 'passenger.identity.phone') && !has(payload, 'passenger.identity.phone_trunc')) {
      set(base, 'passenger.identity', {
        over_18: faker.random.arrayElement([true, false, null]),
        phone: faker.phone.phoneNumber('+336########'),
      });
    }

    if (!has(payload, 'driver.identity.phone') && !has(payload, 'driver.identity.phone_trunc')) {
      set(base, 'driver.identity', {
        over_18: faker.random.arrayElement([true, false, null]),
        phone: faker.phone.phoneNumber('+336########'),
      });
    }

    return merge(base, payload);
  }
}
