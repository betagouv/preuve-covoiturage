import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { JourneyInterface, PersonInterface, TripSearchInterface } from '@pdc/provider-schema/dist';

import {
  LightTripInterface,
  TripPgRepositoryInterface,
  TripPgRepositoryProviderInterfaceResolver,
} from '../interfaces';

/*
 * Trip specific repository
 */
@provider({
  identifier: TripPgRepositoryProviderInterfaceResolver,
})
export class TripPgRepositoryProvider implements TripPgRepositoryInterface {
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

  public async findOrCreateTripForJourney(journey: JourneyInterface): Promise<[boolean, { _id: string }]> {
    try {
      await this.connection.getClient().query('BEGIN');
      let trip;
      let created = false;

      if (journey.operator_journey_id) {
        trip = await this.findTripIdByOperatorTripId(journey.operator_journey_id);
      }

      if (!trip && journey.driver.identity.phone && journey.driver.start.datetime) {
        trip = await this.findTripIdByIdentityAndDate(journey.driver.identity.phone, journey.driver.start.datetime);
      }

      if (!trip) {
        trip = await this.createNewTrip(journey.operator_journey_id);
        created = true;
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
      return [created, trip];
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
          payments,
          calc_distance,
          calc_duration
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
          $30,
          $31,
          $32
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

        Math.round(participant.calc_distance),
        Math.round(participant.calc_duration),
      ],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to save journey ${participant.journey_id} on trip ${tripId}`);
    }
  }

  protected buildWhereClauses(
    filters: TripSearchInterface,
  ): {
    text: string;
    values: any[];
  } {
    const filtersToProcess = [
      'territory_id',
      'operator_id',
      // 'status',
      'date',
      'ranks',
      'distance',
      'towns',
      // 'campaign_id',
      'days',
      'hour',
    ].filter((key) => key in filters);

    if (filtersToProcess.length === 0) {
      return;
    }

    const orderedFilters = filtersToProcess
      .map((key) => ({ key, value: filters[key] }))
      .map((filter) => {
        switch (filter.key) {
          case 'territory_id':
            return {
              text: '(start_territory = ANY ($#::text[]) OR end_territory = ANY ($#::text[]))',
              values: [filter.value, filter.value],
            };
          case 'operator_id':
            return {
              text: 'operator_id = ANY ($#::text[])',
              values: [filter.value],
            };
          case 'status':
            throw new Error('Unimplemented');
          case 'date':
            if (filter.value.start && filter.value.end) {
              return {
                text: '($#::timestamp < start_datetime AND start_datetime < $#::timestamp)',
                values: [filter.value.start, filter.value.end],
              };
            }
            if (filter.value.start) {
              return {
                text: '$#::timestamp < start_datetime',
                values: [filter.value.start],
              };
            }
            return {
              text: 'start_datetime < $#::timestamp',
              values: [filter.value.end],
            };
          case 'ranks':
            return {
              text: 'operator_class = ANY ($#::text[])',
              values: [filter.value],
            };
          case 'distance':
            if (filter.value.min && filter.value.max) {
              return {
                text: '($#::int <= distance AND distance <= $#::int)',
                values: [filter.value.min, filter.value.max],
              };
            }
            if (filter.value.min) {
              return {
                text: '$#::int <= distance',
                values: [filter.value.min],
              };
            }
            return {
              text: 'distance <= $#::int',
              values: [filter.value.max],
            };
          case 'campaign_id':
            throw new Error('Unimplemented');
          case 'towns':
            const towns = filter.value.map((v: string) => `%${v}%`);
            return {
              text: 'start_town LIKE ANY($#::text[]) OR end_town LIKE ANY ($#::text[])',
              values: [towns, towns],
            };
          case 'days':
            return {
              text: 'extract(isodow from start_datetime) = ANY ($#::int[])',
              values: [filter.value],
            };
          case 'hour': {
            return {
              text: '($#::int <= extract(hour from start_datetime) AND extract(hour from start_datetime) <= $#::int)',
              values: [filter.value.start, filter.value.end],
            };
          }
        }
      })
      .reduce(
        (acc, current) => {
          acc.text.push(current.text);
          acc.values.push(...current.values);
          return acc;
        },
        {
          text: [],
          values: [],
        },
      );

    const whereClauses = `WHERE ${orderedFilters.text.join(' AND ')}`;
    const whereClausesValues = orderedFilters.values;

    return {
      text: whereClauses,
      values: whereClausesValues,
    };
  }

  public async stats(params: TripSearchInterface): Promise<any> {
    const where = this.buildWhereClauses(params);
    const query = {
      text: `
        WITH data AS
        (
          SELECT
            min(start_datetime::date) as day,
            max(distance) as distance,
            sum(seats) as carpoolers,
            count(*) FILTER (WHERE array_length(incentives, 1) > 0)::int as carpoolers_subsidized
          FROM trip_participants
          ${where ? where.text : ''}
          GROUP BY trip_id
        )
        SELECT
          day,
          sum(distance)::int as distance,
          sum(carpoolers)::int as carpoolers,
          count(*)::int as trip,
          count(*) FILTER (WHERE carpoolers_subsidized > 0)::int as trip_subsidized
        FROM data
        GROUP BY day
        ORDER BY day ASC`,
      values: [
        // casting to int ?
        ...(where ? where.values : []),
      ],
    };

    query.text = query.text.split('$#').reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }

      return `${acc}${current}$${idx + 1}`;
    }, '');

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }

  public async search(params: TripSearchInterface): Promise<LightTripInterface[]> {
    const { limit, skip } = params;
    const where = this.buildWhereClauses(params);
    const query = {
      text: `
        SELECT
          trip_id,
          is_driver,
          start_town,
          end_town,
          start_datetime,
          operator_id,
          incentives,
          operator_class
        FROM trip_participants
        ${where ? where.text : ''}
        ORDER BY start_datetime DESC
        LIMIT $#::integer
        OFFSET $#::integer
      `,
      values: [...(where ? where.values : []), limit, skip],
    };

    query.text = query.text.split('$#').reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }

      return `${acc}${current}$${idx + 1}`;
    }, '');

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }
}
