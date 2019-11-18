import { provider } from '@ilos/common';
import * as uuidv4 from 'uuid/v4';
import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';

import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';
import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import { TripSearchInterface } from '../shared/trip/common/interfaces/TripSearchInterface';
import {
  LightTripInterface,
  TripPgRepositoryInterface,
  TripPgRepositoryProviderInterfaceResolver,
} from '../interfaces';

import { ResultWithPagination } from '../shared/common/interfaces/ResultWithPagination';

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

  protected async createNewTrip(client: PoolClient, operatorTripId?: string): Promise<{ _id: string }> {
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

    const result = await client.query(query);

    if (result.rowCount === 0) {
      throw new Error('Oups');
    }

    return this.castTypes(result.rows[0]);
  }

  public async findOrCreateTripForJourney(
    journey: JourneyInterface & { created_at: Date },
  ): Promise<[boolean, { _id: string }]> {
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

    let orderedFilters = {
      text: [],
      values: [],
    };

    if (filtersToProcess.length > 0) {
      orderedFilters = filtersToProcess
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
                  text: '($#::timestamp <= datetime AND datetime <= $#::timestamp)',
                  values: [filter.value.start, filter.value.end],
                };
              }
              if (filter.value.start) {
                return {
                  text: '$#::timestamp <= datetime',
                  values: [filter.value.start],
                };
              }
              return {
                text: 'datetime <= $#::timestamp',
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
    }

    orderedFilters.text.push('is_driver = false');

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
      SELECT
        datetime::date as day,
        sum(distance*seats)::int as distance,
        sum(seats+1)::int as carpoolers,
        count(*)::int as trip,
        '0'::int as trip_subsidized,
        count(distinct operator_id)::int as operators
      FROM ${this.table}
      ${where ? where.text : ''}
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
    return result.rows.map(this.castTypes);
  }

  public async search(params: TripSearchInterface): Promise<ResultWithPagination<LightTripInterface>> {
    const { limit, skip } = params;
    const where = this.buildWhereClauses(params);
    const query = {
      text: `
        SELECT
          count(*) over() as total_count,
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

    const pagination = {
      limit,
      total: 0,
      offset: skip,
    };

    if (result.rows.length === 0) {
      return {
        data: [],
        meta: {
          pagination,
        },
      };
    }

    pagination.total = result.rows[0].total_count;

    let finalDatas = result.rows.map(({ total_count, ...data }) => data).map(this.castTypes);

    // operator is not exposed if not defined in visible_operator_ids or if visible_operator_ids is not defined
    if (params.visible_operator_ids) {
      // tslint:disable-arrow-body-style
      finalDatas = finalDatas.map((row) => ({
        ...row,
        operator_id: params.visible_operator_ids.indexOf(row.operator_id) === -1 ? null : row.operator_id,
      }));
    }

    return {
      data: finalDatas,
      meta: {
        pagination,
      },
    };
  }

  private castTypes(row: any): any {
    return {
      ...row,
      operator_id: typeof row.operator_id === 'string' ? parseInt(row.operator_id, 10) : row.operator_id,
      start_territory:
        typeof row.start_territory === 'string' ? parseInt(row.start_territory, 10) : row.start_territory,
      end_territory: typeof row.end_territory === 'string' ? parseInt(row.end_territory, 10) : row.end_territory,
    };
  }
}
