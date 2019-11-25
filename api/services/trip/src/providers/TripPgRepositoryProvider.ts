import { provider } from '@ilos/common';
import v4 from 'uuid/v4';
import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';

import { AcquisitionInterface } from '../shared/acquisition/common/interfaces/AcquisitionInterface';
import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import {
  TripSearchInterfaceWithPagination,
  TripSearchInterface,
} from '../shared/trip/common/interfaces/TripSearchInterface';
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

  protected buildWhereClauses(
    filters: Partial<TripSearchInterface>,
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
              return {
                text: '(datetime BETWEEN $#::timestamp AND $#::timestamp)',
                values: [
                  filter.value.start || new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
                  filter.value.end || new Date(),
                ],
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

  public async stats(params: Partial<TripSearchInterfaceWithPagination>): Promise<any> {
    // on missing date key, the start will be set to 1 year before now
    const where = this.buildWhereClauses({ date: { start: null }, ...params });

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

  public async search(
    params: Partial<TripSearchInterfaceWithPagination>,
  ): Promise<ResultWithPagination<LightTripInterface>> {
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
          datetime as start_datetime,
          '0'::int as incentives,
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
