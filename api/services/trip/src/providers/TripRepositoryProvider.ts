import { provider } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';
import { promisify } from 'util';

import {
  TripSearchInterfaceWithPagination,
  TripSearchInterface,
} from '../shared/trip/common/interfaces/TripSearchInterface';
import { LightTripInterface, TripRepositoryInterface, TripRepositoryProviderInterfaceResolver } from '../interfaces';

import { ResultWithPagination } from '../shared/common/interfaces/ResultWithPagination';
import { StatInterface } from '../interfaces/StatInterface';

/*
 * Trip specific repository
 */
@provider({
  identifier: TripRepositoryProviderInterfaceResolver,
})
export class TripRepositoryProvider implements TripRepositoryInterface {
  public readonly table = 'trip.list';

  constructor(public connection: PostgresConnection) {}

  protected buildWhereClauses(
    filters: Partial<TripSearchInterface>,
  ): {
    text: string;
    values: any[];
  } | null {
    const filtersToProcess = [
      'territory_id',
      'operator_id',
      // 'status',
      'date',
      'ranks',
      'distance',
      'insee',
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
                text: '(start_territory_id = ANY ($#::int[]) OR end_territory_id = ANY ($#::int[]))',
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
            case 'insee':
              return {
                text: 'start_insee = ANY($#::text[]) OR end_insee = ANY ($#::text[])',
                values: [filter.value, filter.value],
              };
            case 'days':
              return {
                text: 'weekday = ANY ($#::int[])',
                values: [filter.value],
              };
            case 'hour': {
              return {
                text: '($#::int <= dayhour AND dayhour <= $#::int)',
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

    // remove duplicates
    orderedFilters.text.push('is_driver = false');

    const whereClauses = `WHERE ${orderedFilters.text.join(' AND ')}`;
    const whereClausesValues = orderedFilters.values;

    return {
      text: whereClauses,
      values: whereClausesValues,
    };
  }

  public async stats(params: Partial<TripSearchInterfaceWithPagination>): Promise<StatInterface[]> {
    const where = this.buildWhereClauses(params);

    const query = {
      text: `
      SELECT
        datetime::date as day,
        sum(distance*seats)::bigint as distance,
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

    query.text = this.numberPlaceholders(query.text);

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }

  public async searchWithCursor(params: {
    date: { start: Date; end: Date };
    operator_id?: number[];
    territory_id?: number[];
  }): Promise<(count: number) => Promise<LightTripInterface[]>> {
    let where = '';
    const values: any[] = [params.date.start, params.date.end];

    const territoryWhere = '(start_territory_id = ANY ($3::int[]) OR end_territory_id = ANY ($4::int[]))';
    const operatorWhere = (i: number) => `operator_id = ANY ($${i}::text[])`;

    if (params.operator_id && params.territory_id) {
      where = `AND ${operatorWhere(5)} AND ${territoryWhere}`;
      values.push(params.territory_id, params.territory_id, params.operator_id);
    } else if (params.operator_id) {
      where = `AND ${operatorWhere(3)}`;
      values.push(params.operator_id);
    } else if (params.territory_id) {
      where = `AND ${territoryWhere}`;
      values.push(params.territory_id, params.territory_id);
    }

    const query = {
      values,
      text: `
        SELECT
          journey_id,
          trip_id,
          journey_start_datetime,
          journey_start_lat,
          journey_start_lon,
          journey_start_insee,
          journey_start_postcodes,
          journey_start_town,
          journey_start_epci,
          journey_start_country,
          journey_end_datetime,
          journey_end_lat,
          journey_end_lon,
          journey_end_insee,
          journey_end_postcodes,
          journey_end_town,
          journey_end_epci,
          journey_end_country,
          journey_distance,
          journey_duration,
          driver_card,
          passenger_card,
          operator_class,
          passenger_over_18,
          passenger_seats
        FROM trip.export
        WHERE $1::timestamp <= journey_start_datetime AND journey_start_datetime <= $2::timestamp
        ${where}
      `,
    };

    const db = await this.connection.getClient().connect();
    const cursorCb = db.query(new Cursor(query.text, query.values));

    return promisify(cursorCb.read.bind(cursorCb)) as (count: number) => Promise<LightTripInterface[]>;
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
          start_town,
          end_town,
          datetime as start_datetime,
          '0'::int as incentives,
          operator_id::int,
          operator_class
        FROM ${this.table}
        ${where ? where.text : ''}
        ORDER BY start_datetime DESC
        LIMIT $#::integer
        OFFSET $#::integer
      `,
      values: [...(where ? where.values : []), limit, skip],
    };

    // incentives
    query.text = this.numberPlaceholders(query.text);

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

    const final_data = result.rows.map(({ total_count, ...data }) => data).map(this.castTypes);

    return {
      data: final_data,
      meta: {
        pagination,
      },
    };
  }

  // replace $# in query by $1, $2, ...
  private numberPlaceholders(str: string): string {
    return str
      .split('$#')
      .reduce(
        (acc, current, idx, origin) => (idx === origin.length - 1 ? `${acc}${current}` : `${acc}${current}$${idx + 1}`),
        '',
      );
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
