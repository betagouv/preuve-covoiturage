import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { JourneyInterface, PersonInterface } from '@pdc/provider-schema/dist';

/*
 * Trip specific repository
 */
@provider()
export class TripPgRepositoryProvider {
  constructor(public connection: PostgresConnection) {}

  protected async findTripIdByOperatorTripId(operatorTripId: string): Promise<{ _id: string }> {
    const query = {
      text: `
        SELECT _id FROM trips 
        WHERE operator_trip_id = $1
        LIMIT 1
      `,
      values: [operatorTripId],
    };
    const result = await this.connection.getClient().query(query);
    if (result.rowCount === 0) {
      return undefined;
    }
    return result.rows[0];
  }

  protected async findTripIdByIdentityAndDate(phone: string, start: Date | string): Promise<{ _id: string }> {
    const startDate = typeof start === 'string' ? new Date(start).toISOString() : start.toISOString();

    const query = {
      text: `
        SELECT trip_id as _id FROM trip_participants
          WHERE ((identity).phone) = $1
          AND start_datetime >= timestamptz '${startDate}'::timestamptz - interval '2 hour'
          AND start_datetime <= timestamptz '${startDate}'::timestamptz + interval '2 hour'
          LIMIT 1
      `,
      values: [phone],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount === 0) {
      return undefined;
    }
    return result.rows[0];
  }

  protected async createNewTrip(operatorTripId?: string): Promise<{ _id: string }> {
    let query = {
      text: 'INSERT INTO trips (status) values ($1) RETURNING _id',
      values: ['pending'],
    };

    if (operatorTripId) {
      query = {
        text: 'INSERT INTO trips (operator_trip_id, status) values ($1, $2) RETURNING _id',
        values: [
          operatorTripId,
          'pending',
          // status: this.config.get('rules.status.pending'),
        ],
      };
    }

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      throw new Error('Oups');
    }

    return result.rows[0];
  }

  public async findOrCreateTripForJourney(journey: JourneyInterface): Promise<{ _id: string }> {
    try {
      await this.connection.getClient().query('BEGIN');
      let trip;

      if (journey.operator_journey_id) {
        trip = await this.findTripIdByOperatorTripId(journey.operator_journey_id);
      }

      if (!trip && journey.driver.identity.phone && journey.driver.start.datetime) {
        trip = await this.findTripIdByIdentityAndDate(journey.driver.identity.phone, journey.driver.start.datetime);
      }

      if (!trip) {
        trip = await this.createNewTrip(journey.operator_journey_id);
      }
      // add locked status check,
      await this.addParticipantToTrip(
        trip._id,
        {
          ...journey.driver,
          operator_class: journey.operator_class,
          journey_id: journey.journey_id,
          operator_id: journey.operator_id,
        },
        true,
      );

      await this.addParticipantToTrip(trip._id, {
        ...journey.passenger,
        operator_class: journey.operator_class,
        journey_id: journey.journey_id,
        operator_id: journey.operator_id,
      });

      await this.connection.getClient().query('COMMIT');
      return trip;
    } catch (e) {
      await this.connection.getClient().query('ROLLBACK');
      throw e;
    }
  }

  protected async addParticipantToTrip(tripId, participant: PersonInterface, asDriver = false): Promise<void> {
    const query = {
      text: `
        INSERT INTO trip_participants (
          trip_id,
          operator_id,
          journey_id,
          operator_class,
          identity,
          is_driver,
          start_datetime,
          start_position,
          start_insee,
          start_postcodes,
          start_town,
          start_country,
          start_territory,
          start_literal,
          end_datetime,
          end_position,
          end_insee,
          end_postcodes,
          end_town,
          end_country,
          end_territory,
          end_literal,
          distance,
          duration,
          seats,
          contribution,
          revenue,
          expense, 
          incentives,
          payments
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
          $20,
          $21,
          $22,
          $23,
          $24,
          $25,
          $26,
          $27,
          $28,
          $29,
          $30
        )
        ON CONFLICT DO NOTHING
      `,
      values: [
        tripId,
        participant.operator_id,
        participant.journey_id,
        participant.operator_class,

        `(${[
          participant.identity.phone,
          participant.identity.firstname,
          participant.identity.lastname,
          participant.identity.email,
          participant.identity.company,
          null, // participant.identity.travel_pass.name,
          null, // participant.identity.travel_pass.user_id,
          participant.identity.over_18,
        ].join(',')})`,

        asDriver,

        participant.start.datetime,
        `POINT(${participant.start.lat} ${participant.start.lon})`,
        participant.start.insee,
        participant.start.postcodes,
        participant.start.town,
        participant.end.country,
        participant.start.territory,
        participant.start.literal,

        participant.end.datetime,
        `POINT(${participant.end.lat} ${participant.end.lon})`,
        participant.end.insee,
        participant.end.postcodes,
        participant.end.town,
        participant.end.country,
        participant.end.territory,
        participant.end.literal,

        participant.distance,
        participant.duration,
        participant.seats,
        participant.contribution,
        participant.revenue,
        participant.expense,
        participant.incentives,
        participant.payments,
      ],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to save journey ${participant.journey_id} on trip ${tripId}`);
    }
  }
}
