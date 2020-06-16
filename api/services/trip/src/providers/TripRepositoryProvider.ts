import { provider } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';
import { promisify } from 'util';

import {
  TripSearchInterfaceWithPagination,
  TripSearchInterface,
} from '../shared/trip/common/interfaces/TripSearchInterface';
import {
  LightTripInterface,
  ExportTripInterface,
  TripRepositoryInterface,
  TripRepositoryProviderInterfaceResolver,
} from '../interfaces';

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
                text: 'operator_id = ANY ($#::int[])',
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
                text: '(start_insee = ANY($#::text[]) OR end_insee = ANY ($#::text[]))',
                values: [filter.value, filter.value],
              };

            case 'days':
              return {
                text: 'weekday = ANY ($#::int[])',
                values: [filter.value === 0 ? 7 : filter.value],
                // 0 = sunday ... 6 = saturday >> 1 = monday ... 7 = sunday
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
        sum(distance/1000*seats)::int as distance,
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

  public async searchWithCursor(
    params: {
      date: { start: Date; end: Date };
      territory_authorized_operator_id?: number[]; // territory id for operator visibility filtering
      operator_id?: number[];
      territory_id?: number[];
    },
    type = 'opendata',
  ): Promise<(count: number) => Promise<ExportTripInterface[]>> {
    const values = [];

    // all
    const baseFields = [
      'journey_id',
      'trip_id',
      'journey_start_datetime',
      'journey_start_lon',
      'journey_start_lat',
      'journey_start_insee',
      'journey_start_postalcode',
      'journey_start_department',
      'journey_start_town',
      'journey_start_towngroup',
      'journey_start_country',
      'journey_end_datetime',
      'journey_end_lon',
      'journey_end_lat',
      'journey_end_insee',
      'journey_end_postalcode',
      'journey_end_department',
      'journey_end_town',
      'journey_end_towngroup',
      'journey_end_country',
      'driver_card',
      'passenger_card',
      'passenger_over_18',
      'passenger_seats',
      'operator_class',
      'journey_distance',
      'journey_duration',
      'journey_distance_anounced',
      'journey_distance_calculated',
      'journey_duration_anounced',
      'journey_duration_calculated',
    ];

    // all except opendata
    const financialFields = [
      'passenger_id',
      'passenger_contribution',
      'passenger_incentive_raw',
      'passenger_incentive_rpc_raw',
      'driver_id',
      'driver_revenue',
      'driver_incentive_raw',
      'driver_incentive_rpc_raw',
    ];

    let selectedFields = [...baseFields];
    switch (type) {
      case 'territory':
        if (params.territory_authorized_operator_id && params.territory_authorized_operator_id.length) {
          selectedFields = [
            ...selectedFields,
            "(case when operator_id = ANY($#::int[]) then operator else 'NC' end) as operator",
            ...financialFields,
          ];
          values.push(params.territory_authorized_operator_id);
        } else {
          selectedFields = [...selectedFields, "'NC' as operator", ...financialFields];
        }
        break;
      case 'registry':
        selectedFields = [...selectedFields, 'operator', ...financialFields];
        break;
      case 'operator':
        selectedFields = [...selectedFields, ...financialFields];
        break;
    }

    const whereClausesText = ['$#::timestamp <= journey_start_datetime AND journey_start_datetime <= $#::timestamp'];
    values.push(params.date.start, params.date.end);

    if (params.territory_id) {
      whereClausesText.push('(start_territory_id = ANY ($#::int[]) OR end_territory_id = ANY ($#::int[]))');
      values.push(params.territory_id, params.territory_id);
    }

    if (params.operator_id) {
      whereClausesText.push('operator_id = ANY ($#::text[])');
      values.push(params.operator_id);
    }

    const text = `
      SELECT
        ${selectedFields.join(', ')}
      FROM trip.export
      WHERE 
      ${whereClausesText.join(' AND ')}
      ORDER BY journey_start_datetime ASC
    `
      .split('$#')
      .reduce((prev, curr, i) => prev + '$' + i + curr);

    console.log(text, values);
    const db = await this.connection.getClient().connect();
    const cursorCb = db.query(new Cursor(text, values));

    return promisify(cursorCb.read.bind(cursorCb)) as (count: number) => Promise<ExportTripInterface[]>;
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

    const final_data = result.rows.map(({ total_count, ...data }) => data);

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
}
