import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';
import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import { TripSearchInterface } from '../shared/trip/common/interfaces/TripSearchInterface';
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

  public async findOrCreateTripForJourney(
    journey: JourneyInterface & { created_at: Date },
  ): Promise<[boolean, { _id: string }]> {
    try {
      await this.connection.getClient().query('BEGIN');
      let tripId;

      if (journey.operator_journey_id) {
        tripId = await this.findTripIdByOperatorTripId(journey.operator_journey_id);
      }

      if (!tripId && journey.driver.identity.phone && journey.driver.start.datetime) {
        tripId = await this.findTripIdByIdentityAndDate(journey.driver.identity.phone, journey.driver.start.datetime);
      }

      if (!tripId) {
        tripId = 1; // generate random uuid here
      }

      await this.addParticipant(
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

      await this.addParticipant(tripId, {
        ...journey.passenger,
        operator_class: journey.operator_class,
        journey_id: journey.journey_id,
        operator_id: journey.operator_id,
        operator_trip_id: journey.operator_journey_id,
        created_at: journey.created_at,
      });

      await this.connection.getClient().query('COMMIT');
      return [false, { _id: tripId }];
    } catch (e) {
      await this.connection.getClient().query('ROLLBACK');
      throw e;
    }
  }

  protected async addParticipant(
    tripId: string,
    participant: PersonInterface & { operator_trip_id: string; created_at: Date },
    asDriver = false,
  ): Promise<void> {
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
        participant.operator_class,
        participant.start.datetime,
        participant.duration,
        `POINT(${participant.start.lat} ${participant.start.lon})`,
        participant.start.insee,
        participant.start.town,
        participant.start.territory,
        `POINT(${participant.end.lat} ${participant.end.lon})`,
        participant.end.insee,
        participant.end.town,
        participant.end.territory,
        participant.distance,
        participant.seats,
        participant.created_at,
        participant.operator_trip_id,
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
                text: '($#::timestamp < datetime AND datetime < $#::timestamp)',
                values: [filter.value.start, filter.value.end],
              };
            }
            if (filter.value.start) {
              return {
                text: '$#::timestamp < datetime',
                values: [filter.value.start],
              };
            }
            return {
              text: 'datetime < $#::timestamp',
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
              text: 'extract(isodow from datetime) = ANY ($#::int[])',
              values: [filter.value],
            };
          case 'hour': {
            return {
              text: '($#::int <= extract(hour from datetime) AND extract(hour from datetime) <= $#::int)',
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
            min(datetime::date) as day,
            max(distance) as distance,
            sum(seats) as carpoolers,
            '0'::int as carpoolers_subsidized
          FROM ${this.table}
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
      // count(*) FILTER (WHERE array_length(incentives, 1) > 0)
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
          datetime,
          operator_id,
          operator_class
        FROM ${this.table}
        ${where ? where.text : ''}
        ORDER BY datetime DESC
        LIMIT $#::integer
        OFFSET $#::integer
      `,
      values: [...(where ? where.values : []), limit, skip],
    };
    // incentives
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
