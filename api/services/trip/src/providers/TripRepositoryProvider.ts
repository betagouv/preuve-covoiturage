import { provider } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';
import { promisify } from 'util';
import { map } from 'lodash';

import {
  TripSearchInterfaceWithPagination,
  TripSearchInterface,
} from '../shared/trip/common/interfaces/TripSearchInterface';
import {
  TzResultInterface,
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
  private defaultTz: TzResultInterface = { name: 'GMT', utc_offset: '00:00:00' };

  constructor(public connection: PostgresConnection) {}

  protected async buildWhereClauses(
    filters: Partial<TripSearchInterface>,
  ): Promise<{
    text: string;
    values: any[];
  } | null> {
    const filtersToProcess = [
      'territory_id',
      'operator_id',
      'status',
      'date',
      'ranks',
      'distance',
      'campaign_id',
      'days',
      'hour',
    ].filter((key) => key in filters);

    let orderedFilters = {
      text: [],
      values: [],
    };

    if (filters.territory_id) {
      const territoriesIds = typeof filters.territory_id === 'number' ? [filters.territory_id] : filters.territory_id;
      const descendantsIds = await this.connection.getClient().query({
        text: `SELECT * FROM territory.get_descendants($1::int[]) as _ids`,
        values: [territoriesIds],
      });
      if (descendantsIds.rowCount > 0 && descendantsIds.rows[0]._ids) {
        filters.territory_id = [...territoriesIds, ...descendantsIds.rows[0]._ids];
      }
    }

    if (filtersToProcess.length > 0) {
      orderedFilters = filtersToProcess
        .map((key) => ({ key, value: filters[key] }))
        .map((filter) => {
          switch (filter.key) {
            case 'territory_id':
              return {
                text: `(start_territory_id = ANY($#::int[]) OR end_territory_id = ANY($#::int[]))`,
                values: [filter.value, filter.value],
              };

            case 'operator_id':
              return {
                text: 'operator_id = ANY ($#::int[])',
                values: [filter.value],
              };

            case 'status':
              return {
                text: 'status = $#',
                values: [filter.value],
              };

            case 'date':
              if (filter.value.start && filter.value.end) {
                return {
                  text: '(journey_start_datetime >= $#::timestamp AND journey_start_datetime < $#::timestamp)',
                  values: [filter.value.start, filter.value.end],
                };
              }
              if (filter.value.start) {
                return {
                  text: 'journey_start_datetime >= $#::timestamp',
                  values: [filter.value.start],
                };
              }
              return {
                text: 'journey_start_datetime < $#::timestamp',
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
                  text: '(journey_distance >= $#::int AND journey_distance < $#::int)',
                  values: [filter.value.min, filter.value.max],
                };
              }
              if (filter.value.min) {
                return {
                  text: 'journey_distance >= $#::int',
                  values: [filter.value.min],
                };
              }
              return {
                text: 'journey_distance < $#::int',
                values: [filter.value.max],
              };

            case 'campaign_id':
              return {
                text: 'applied_policies && $#::int[]',
                values: [filter.value],
              };

            case 'days':
              return {
                text: 'journey_start_weekday = ANY ($#::int[])',
                values: [filter.value === 0 ? 7 : filter.value],
                // 0 = sunday ... 6 = saturday >> 1 = monday ... 7 = sunday
              };
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

    const whereClauses = `${orderedFilters.text.join(' AND ')}`;
    const whereClausesValues = orderedFilters.values;

    return {
      text: whereClauses,
      values: whereClausesValues,
    };
  }

  public async stats(params: Partial<TripSearchInterfaceWithPagination>): Promise<StatInterface[]> {
    const where = await this.buildWhereClauses(params);
    const tz = await this.validateTz(params.tz);

    const values = [...(where ? where.values : []), tz.name];
    const text = `
      SELECT
        (journey_start_datetime AT TIME ZONE $${values.length})::date as day,
        sum(passenger_seats)::int as trip,
        sum(journey_distance/1000*passenger_seats)::int as distance,
        (count(distinct driver_id) + count(distinct passenger_id))::int as carpoolers,
        count(distinct operator_id)::int as operators,
        trunc(
          ((sum(passenger_seats + 1)::float) / count(distinct trip_id))::numeric, 2
        )::float as average_carpoolers_by_car,
        (count(*) FILTER (
          WHERE (passenger_incentive_rpc_sum + driver_incentive_rpc_sum)::int > 0
        ))::int as trip_subsidized
      FROM ${this.table}
      ${where.text ? `WHERE ${where.text}` : ''}
      GROUP BY day
      ORDER BY day ASC
    `;

    const result = await this.connection.getClient().query({
      values,
      text: this.numberPlaceholders(text),
    });

    return result.rows;
  }

  public async searchWithCursor(
    params: {
      tz: string;
      date: { start: Date; end: Date };
      territory_authorized_operator_id?: number[]; // territory id for operator visibility filtering
      operator_id?: number[];
      territory_id?: number[];
    },
    type = 'opendata',
  ): Promise<(count: number) => Promise<ExportTripInterface[]>> {
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
      'passenger_incentive_raw::json[]',
      'passenger_incentive_rpc_raw::json[]',
      'driver_id',
      'driver_revenue',
      'driver_incentive_raw::json[]',
      'driver_incentive_rpc_raw::json[]',
    ];

    let selectedFields = [...baseFields];
    const { territory_authorized_operator_id, ...cleanParams } = params;
    const values = [];
    switch (type) {
      case 'territory':
        if (territory_authorized_operator_id && territory_authorized_operator_id.length) {
          selectedFields = [
            ...selectedFields,
            "(case when operator_id = ANY($#::int[]) then operator else 'NC' end) as operator",
            ...financialFields,
          ];
          values.push(territory_authorized_operator_id);
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

    const where = await this.buildWhereClauses(cleanParams);

    const queryValues = [...values, ...where.values];
    const queryText = this.numberPlaceholders(`
      SELECT
        ${selectedFields.join(', ')}
      FROM ${this.table}
      ${where.text ? `WHERE ${where.text}` : ''}
      ORDER BY journey_start_datetime ASC
    `);

    const db = await this.connection.getClient().connect();
    const cursorCb = db.query(new Cursor(queryText, queryValues));

    return promisify(cursorCb.read.bind(cursorCb)) as (count: number) => Promise<ExportTripInterface[]>;
  }

  public async searchCount(params: Partial<TripSearchInterfaceWithPagination>): Promise<{ count: string }> {
    const where = await this.buildWhereClauses(params);

    // COUNT(*) is a BIGINT (int8) which is casted as string by node-postgres
    // to avoid overflows (max value of bigint > Number.MAX_SAFE_INTEGER)
    const query = {
      text: `
        SELECT COUNT(*)
        FROM ${this.table}
        ${where.text ? `WHERE ${where.text}` : ''}
      `,
      values: [...(where ? where.values : [])],
    };

    query.text = this.numberPlaceholders(query.text);
    const result = await this.connection.getClient().query(query);

    return { count: result.rowCount ? result.rows[0].count : -1 };
  }

  public async search(
    params: Partial<TripSearchInterfaceWithPagination>,
  ): Promise<ResultWithPagination<LightTripInterface>> {
    const { limit, skip } = params;
    const where = await this.buildWhereClauses(params);

    const query = {
      text: `
        SELECT
          trip_id,
          journey_start_town as start_town,
          journey_end_town as end_town,
          journey_start_datetime as start_datetime,
          (passenger_incentive_rpc_sum + driver_incentive_rpc_sum)::int as incentives,
          operator_id::int,
          operator_class,
          (driver_incentive_rpc_raw || passenger_incentive_rpc_raw)::json[] as campaigns_id,
          status
        FROM ${this.table}
        ${where.text ? `WHERE ${where.text}` : ''}
        ORDER BY journey_start_datetime DESC
        LIMIT $#::integer
        OFFSET $#::integer
      `,
      values: [...(where ? where.values : []), limit, skip],
    };

    query.text = this.numberPlaceholders(query.text);

    const result = await this.connection.getClient().query(query);
    const pagination = { limit, total: -1, offset: skip };

    if (!result.rowCount) {
      return { data: [], meta: { pagination } };
    }

    // manually map results to data structure to keep pg sorting
    const data = new Array(result.rows.length);
    let index = 0;
    while (index < data.length) {
      data[index] = result.rows[index];
      data[index]['campaigns_id'] = [...new Set(map(result.rows[index]['campaigns_id'] || [], 'policy_id'))];
      index += 1;
    }

    return { data, meta: { pagination } };
  }

  // validate given timezone against PostgreSQL list.
  // JSON schema's tzMacro should have validated this before.
  // You might need to update the tzMacro list if PostgreSQL updates.
  public async validateTz(tz?: string): Promise<TzResultInterface> {
    if (!tz) return this.defaultTz;

    const resTimezone = await this.connection.getClient().query<TzResultInterface>({
      text: 'SELECT name, utc_offset::text FROM pg_timezone_names WHERE LOWER(name) = LOWER($1)',
      values: [tz],
    });

    return resTimezone.rowCount ? resTimezone.rows[0] : this.defaultTz;
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
