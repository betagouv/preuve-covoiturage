import { provider } from '@ilos/common';
import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';

import {
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
} from '../interfaces/CarpoolRepositoryProviderInterface';

import { PeopleWithIdInterface } from '../interfaces/Carpool';

/*
 * Trip specific repository
 */
@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolRepositoryProvider implements CarpoolRepositoryProviderInterface {
  public readonly table = 'carpool.carpools';

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
    await this.connection.getClient().query(query);
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
    },
    people: PeopleWithIdInterface[],
  ): Promise<void> {
    const client = await this.connection.getClient().connect();
    try {
      await client.query('BEGIN');

      for (const person of people) {
        await this.addParticipant(client, shared, person);
      }

      await client.query('COMMIT');
      await client.release();
      return;
    } catch (e) {
      await client.query('ROLLBACK');
      await client.release();
      throw e;
    }
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
          start_insee,
          end_position,
          end_insee,
          distance,
          seats,
          created_at,
          operator_trip_id,
          cost,
          operator_journey_id,
          meta
        )
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
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
        person.start.insee,
        `POINT(${person.end.lon} ${person.end.lat})`,
        person.end.insee,
        person.distance,
        person.seats,
        shared.created_at,
        shared.operator_trip_id,
        person.cost,
        shared.operator_journey_id,
        JSON.stringify(person.meta),
      ],
    };

    const result = await client.query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to save journey ${shared.acquisition_id} on trip ${shared.trip_id}`);
    }
  }
}
