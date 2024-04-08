import { provider } from '@ilos/common';
import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';

import {
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
} from '../interfaces/CarpoolRepositoryProviderInterface';

import { PeopleWithIdInterface, IncentiveInterface } from '../interfaces/Carpool';

/*
 * Trip specific repository
 */
@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolRepositoryProvider implements CarpoolRepositoryProviderInterface {
  public readonly table = 'carpool.carpools';
  public readonly incentiveTable = 'carpool.incentives';

  constructor(protected connection: PostgresConnection) {}

  public async updateStatus(acquisition_id: number, status: string): Promise<void> {
    const query = {
      text: `
        UPDATE ${this.table}
        SET status = $1::carpool.carpool_status_enum
        WHERE acquisition_id = $2::int
      `,
      values: [status, acquisition_id],
    };
    await this.connection.getClient().query<any>(query);
  }

  public async importFromAcquisition(
    shared: {
      acquisition_id: number; // _id
      operator_id: number;
      operator_journey_id: string; // journey_id  // TODO: add this !
      created_at: Date;
      operator_class: string;
      operator_trip_id: string;
      trip_id: string;
      status: string;
      incentives: IncentiveInterface[];
    },
    people: PeopleWithIdInterface[],
  ): Promise<void> {
    const client = await this.connection.getClient().connect();
    try {
      await client.query<any>('BEGIN');
      for (const person of people) {
        await this.addParticipant(client, shared, person);
      }
      await this.addIncentives(client, shared.acquisition_id, people[0].datetime, shared.incentives);
      await client.query<any>('COMMIT');
    } catch (e) {
      await client.query<any>('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  protected async addIncentives(
    client: PoolClient,
    acquisition_id: number,
    datetime: Date,
    incentives: IncentiveInterface[],
  ) {
    const values = incentives
      .map((i) => ({ acquisition_id: acquisition_id, idx: i.index, datetime, siret: i.siret, amount: i.amount }))
      .reduce(
        ([acq, idx, datet, siret, amount], i) => {
          acq.push(i.acquisition_id);
          idx.push(i.idx);
          datet.push(i.datetime);
          siret.push(i.siret);
          amount.push(i.amount);
          return [acq, idx, datet, siret, amount];
        },
        [[], [], [], [], []],
      );
    const query = {
      text: `
        INSERT INTO ${this.incentiveTable} (
          acquisition_id,
          idx,
          datetime,
          siret,
          amount
        )
        SELECT * FROM UNNEST(
          $1::int[],
          $2::smallint[],
          $3::timestamp[],
          $4::varchar[],
          $5::int[]
        )
        ON CONFLICT (acquisition_id, idx) DO NOTHING`,
      values,
    };

    await client.query<any>(query);
  }

  protected async addParticipant(
    client: PoolClient,
    shared: {
      acquisition_id: number; // _id
      operator_id: number;
      operator_journey_id: string; // journey_id  // TODO: add this !
      created_at: Date;
      operator_class: string;
      trip_id: string;
      operator_trip_id: string;
      status: string;
      incentives: IncentiveInterface[];
    },
    person: PeopleWithIdInterface,
  ): Promise<void> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          acquisition_id,
          operator_id,
          trip_id,
          identity_id,
          status,
          is_driver,
          operator_class,
          datetime,
          duration,
          start_position,
          start_geo_code,
          end_position,
          end_geo_code,
          distance,
          seats,
          created_at,
          operator_trip_id,
          cost,
          payment,
          operator_journey_id,
          meta
        )
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        ON CONFLICT (acquisition_id, is_driver) DO NOTHING`,
      values: [
        shared.acquisition_id,
        shared.operator_id,
        shared.trip_id,
        person.identity_id,
        shared.status,
        person.is_driver,
        shared.operator_class,
        person.datetime,
        person.duration,
        `POINT(${person.start.lon} ${person.start.lat})`,
        person.start.geo_code,
        `POINT(${person.end.lon} ${person.end.lat})`,
        person.end.geo_code,
        person.distance,
        person.seats,
        shared.created_at,
        shared.operator_trip_id,
        person.cost,
        person.payment,
        shared.operator_journey_id,
        JSON.stringify(person.meta),
      ],
    };

    await client.query<any>(query);
  }
}
