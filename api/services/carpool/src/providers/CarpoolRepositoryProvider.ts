import { provider } from '@ilos/common';
import * as uuidv4 from 'uuid/v4';
import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';

import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';
import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import {
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
} from '../interfaces/CarpoolRepositoryProviderInterface';

/*
 * Carpool repository
 */
@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolRepositoryProvider implements CarpoolRepositoryProviderInterface {
  public readonly table = 'carpool.carpools';

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

  protected async findTripIdByIdentityAndDate(phone: string, start: Date | string): Promise<string | null> {
    const startDate = typeof start === 'string' ? new Date(start).toISOString() : start.toISOString();

    const query = {
      text: `
        SELECT trip_id as _id FROM ${this.table}
          WHERE ((identity).phone) = $1
          AND datetime >= timestamptz '${startDate}'::timestamptz - interval '2 hour'
          AND datetime <= timestamptz '${startDate}'::timestamptz + interval '2 hour'
          LIMIT 1
      `,
      values: [phone],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount === 0) {
      return null;
    }
    return result.rows[0]._id;
  }

  public async importJourney (
    journey: JourneyInterface & { created_at: Date },
  ): Promise<void> {
    const client = await this.connection.getClient().connect();
    try {
      await client.query('BEGIN');
      let tripId;

      if (journey.operator_journey_id) {
        tripId = await this.findTripIdByOperatorTripId(journey.operator_journey_id);
      }

      if (!tripId && journey.driver.identity.phone && journey.driver.start.datetime) {
        tripId = await this.findTripIdByIdentityAndDate(journey.driver.identity.phone, journey.driver.start.datetime);
      }

      if (!tripId) {
        tripId = uuidv4();
      }

      await this.addParticipant(
        client,
        tripId,
        {
          ...journey.driver,
          operator_class: journey.operator_class,
          journey_id: journey.journey_id,
          operator_id: journey.operator_id,
          operator_trip_id: journey.operator_journey_id,
          created_at: journey.created_at,
        },
        true,
      );

      await this.addParticipant(
        client,
        tripId,
        {
          ...journey.passenger,
          operator_class: journey.operator_class,
          journey_id: journey.journey_id,
          operator_id: journey.operator_id,
          operator_trip_id: journey.operator_journey_id,
          created_at: journey.created_at,
        },
        false,
      );

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
    tripId: string,
    participant: PersonInterface & { operator_trip_id: string; created_at: Date },
    asDriver = false,
  ): Promise<void> {
    const identity = participant.identity;
    const flatidentity = `(${[
      'phone' in identity ? identity.phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null,
      'firstname' in identity ? identity.firstname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null,
      'lastname' in identity ? identity.lastname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null,
      'email' in identity ? identity.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null,
      'company' in identity ? identity.company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : null,
      null, // participant.identity.travel_pass.name,
      null, // participant.identity.travel_pass.user_id,
      participant.identity.over_18,
    ].join(',')})`;

    const query = {
      text: `
        INSERT INTO ${this.table} (
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
        participant.journey_id,
        participant.operator_id,
        tripId,
        flatidentity,
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
