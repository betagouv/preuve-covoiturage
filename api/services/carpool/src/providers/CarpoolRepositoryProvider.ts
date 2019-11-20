import { provider } from '@ilos/common';
import v4 from 'uuid/v4';
import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';

import { AcquisitionInterface } from '../shared/acquisition/common/interfaces/AcquisitionInterface';
import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import {
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
} from '../interfaces/CarpoolRepositoryProviderInterface';


/*
 * Trip specific repository
 */
@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolRepositoryProvider implements CarpoolRepositoryProviderInterface {
  public readonly table = 'carpool.carpools';
  public readonly identityTable = 'carpool.identities';

  constructor(public connection: PostgresConnection) {}

  protected async findTripIdByOperatorTripId(operatorTripId: string): Promise<string | null> {
    const query = {
      text: `
        SELECT trip_id as _id FROM ${this.table}
        WHERE operator_trip_id = $1
        LIMIT 1
      `,
      values: [operatorTripId],
    };
    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0]._id;
  }

  // protected async findTripIdByIdentityAndDate(phone: string, start: Date | string): Promise<string | null> {
  //   const startDate = typeof start === 'string' ? new Date(start).toISOString() : start.toISOString();

  //   const query = {
  //     text: `
  //       SELECT trip_id as _id FROM ${this.table}
  //         WHERE ((identity).phone) = $1
  //         AND datetime >= timestamptz '${startDate}'::timestamptz - interval '2 hour'
  //         AND datetime <= timestamptz '${startDate}'::timestamptz + interval '2 hour'
  //         LIMIT 1
  //     `,
  //     values: [phone],
  //   };

  //   const result = await this.connection.getClient().query(query);
  //   if (result.rowCount === 0) {
  //     return null;
  //   }
  //   return result.rows[0]._id;
  // }

  public async findOrCreateTripForJourney(journey: AcquisitionInterface): Promise<[boolean, { _id: string }]> {
    const client = await this.connection.getClient().connect();

    try {
      await client.query('BEGIN');
      let tripId;

      if (journey.payload.operator_journey_id) {
        tripId = await this.findTripIdByOperatorTripId(journey.payload.operator_journey_id);
      }

      // if (!tripId && journey.driver.identity.phone && journey.driver.start.datetime) {
      //   tripId = await this.findTripIdByIdentityAndDate(journey.driver.identity.phone, journey.driver.start.datetime);
      // }

      if (journey.payload.driver) {
        await this.addParticipant(
          client,
          tripId,
          {
            ...journey.payload.driver,
            operator_class: journey.payload.operator_class,
            journey_id: journey.journey_id,
            operator_id: journey.operator_id,
            acquisition_id: journey._id,
            operator_trip_id: journey.payload.operator_journey_id,
            created_at: journey.created_at,
          },
          true,
        );
      }

      if (journey.payload.passenger) {
        await this.addParticipant(
          client,
          tripId,
          {
            ...journey.payload.passenger,
            operator_class: journey.payload.operator_class,
            journey_id: journey.journey_id,
            operator_id: journey.operator_id,
            acquisition_id: journey._id,
            operator_trip_id: journey.payload.operator_journey_id,
            created_at: journey.created_at,
          },
          false,
        );
      }

      await client.query('COMMIT');
      await client.release();
      return [false, { _id: tripId }];
    } catch (e) {
      await client.query('ROLLBACK');
      await client.release();
      throw e;
    }
  }

  protected async addParticipant(
    client: PoolClient,
    tripId: string,
    participant: PersonInterface & { acquisition_id: number; operator_trip_id: string; created_at: Date },
    asDriver = false,
  ): Promise<void> {
    const idResult = await this.connection.getClient().query({
      text: `
        INSERT INTO ${this.identityTable}
        (
          phone,
          phone_trunc,
          operator_user_id,
          firstname,
          lastname,
          email,
          company,
          travel_pass_name,
          travel_pass_user_id,
          over_18
        ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )
        RETURNING _id
      `,
      values: [
        participant.identity.phone,
        participant.identity.phone_trunc,
        participant.identity.operator_user_id,
        participant.identity.firstname,
        participant.identity.lastname,
        participant.identity.email,
        participant.identity.company,
        participant.identity.travel_pass_name,
        participant.identity.travel_pass_user_id,
        participant.identity.over_18,
      ],
    });

    if (!idResult.rowCount) throw new Error('Failed to insert identity');
    const identity = idResult.rows[0];

    const query = {
      text: `
        INSERT INTO ${this.table} (
          acquisition_id,
          operator_id,
          trip_id,
          identity_id,
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
        )
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20 )`,
      values: [
        participant.acquisition_id,
        participant.operator_id,
        tripId || v4(),
        identity._id,
        asDriver,
        participant.operator_class,
        participant.start.datetime,
        participant.duration,
        `POINT(${participant.start.lon} ${participant.start.lat})`,
        participant.start.insee,
        participant.start.town,
        participant.start.territory_id,
        `POINT(${participant.end.lon} ${participant.end.lat})`,
        participant.end.insee,
        participant.end.town,
        participant.end.territory_id,
        participant.distance,
        participant.seats,
        participant.created_at,
        participant.operator_trip_id,
      ],
    };

    const result = await client.query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to save journey ${participant.journey_id} on trip ${tripId}`);
    }
  }
}
