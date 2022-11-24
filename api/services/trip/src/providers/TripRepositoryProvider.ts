/* eslint-disable max-len */
import { provider } from '@ilos/common';
import { Cursor, PostgresConnection } from '@ilos/connection-postgres';
import { map, set } from 'lodash';
import { promisify } from 'util';
import {
  CampaignSearchParamsInterface,
  ExportTripInterface,
  TripRepositoryInterface,
  TripRepositoryProviderInterfaceResolver,
  TzResultInterface,
} from '../interfaces';
import { PgCursorHandler } from '../interfaces/PromisifiedPgCursor';
import { PolicyStatsInterface } from '../interfaces/PolicySliceStatInterface';
import { FinancialStatInterface, StatInterface } from '../interfaces/StatInterface';
import { ResultWithPagination } from '../shared/common/interfaces/ResultWithPagination';
import { SliceInterface } from '../shared/policy/common/interfaces/SliceInterface';
import { LightTripInterface } from '../shared/trip/common/interfaces/LightTripInterface';
import { TerritoryTripsInterface } from '../shared/trip/common/interfaces/TerritoryTripsInterface';
import {
  TripSearchInterface,
  TripSearchInterfaceWithPagination,
} from '../shared/trip/common/interfaces/TripSearchInterface';
import { TripStatInterface } from '../shared/trip/common/interfaces/TripStatInterface';

/*
 * Trip specific repository
 */
@provider({
  identifier: TripRepositoryProviderInterfaceResolver,
})
export class TripRepositoryProvider implements TripRepositoryInterface {
  public readonly table = 'trip.list';
  public static readonly MAX_KM_LIMIT = 500000;
  private defaultTz: TzResultInterface = { name: 'GMT', utc_offset: '00:00:00' };

  constructor(public connection: PostgresConnection) {}

  protected async buildWhereClauses(filters: Partial<TripSearchInterface>): Promise<{
    text: string;
    values: any[];
  } | null> {
    const filtersToProcess = [
      'geo_selector',
      'status',
      'date',
      'ranks',
      'distance',
      'campaign_id',
      'operator_id',
      'days',
      'hour',
      'excluded_start_geo_code',
      'excluded_end_geo_code',
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
            case 'excluded_start_geo_code':
              if (!filter.value || !Array.isArray(filter.value)) {
                return;
              }
              return {
                text: `journey_start_insee <> ALL($#::varchar[])`,
                values: [filter.value],
              };
            case 'excluded_end_geo_code':
              if (!filter.value || !Array.isArray(filter.value)) {
                return;
              }
              return {
                text: `journey_end_insee <> ALL($#::varchar[])`,
                values: [filter.value],
              };
            case 'geo_selector':
              if (!filter.value || !filter.value.com || !Array.isArray(filter.value?.com)) {
                return;
              }
              const territoryFilterValue = filter.value.com;
              return {
                text: `(journey_start_insee = ANY($#::varchar[]) OR journey_end_insee = ANY($#::varchar[]))`,
                values: [territoryFilterValue, territoryFilterValue],
              };
            case 'operator_id':
              const operatorFilterValue = Array.isArray(filter.value) ? filter.value : [filter.value];
              return {
                text: 'operator_id = ANY ($#::int[])',
                values: [operatorFilterValue],
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
                text: 'applied_policies && $#::int[] AND (passenger_incentive_rpc_sum > 0 OR driver_incentive_rpc_sum > 0)',
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
            if (!current || !current.text) {
              return acc;
            }
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

  public async getOpendataExcludedTerritories(params: TripSearchInterface): Promise<TerritoryTripsInterface[]> {
    const where = await this.buildWhereClauses(params);

    const excluded_start_sql_text = this.numberPlaceholders(`
      SELECT
        journey_start_insee AS start_geo_code,
        null AS end_geo_code,
        ARRAY_AGG(journey_id) AS aggregated_trips_journeys
      FROM ${this.table} 
      WHERE ${where.text} 
      AND journey_start_insee is not null
      GROUP BY journey_start_insee 
      HAVING COUNT (journey_start_insee) < 6
    `);

    const excluded_end_sql_text = this.numberPlaceholders(`
      SELECT
        null AS start_geo_code,
        journey_end_insee AS end_geo_code,
        ARRAY_AGG(journey_id) AS aggregated_trips_journeys
      FROM ${this.table} 
      WHERE ${where.text} 
      AND journey_end_insee is not null
      GROUP BY journey_end_insee 
      HAVING COUNT (journey_end_insee) < 6
    `);

    const query = {
      text: `${excluded_start_sql_text} UNION ALL ${excluded_end_sql_text}`,
      values: where.values,
    };

    query.text = this.numberPlaceholders(query.text);
    const result = await this.connection.getClient().query(query);
    return !result.rowCount ? [] : result.rows;
  }

  public async stats(params: Partial<TripStatInterface>): Promise<StatInterface[]> {
    const where = await this.buildWhereClauses(params);

    const selectSwitch = {
      day: 'journey_start_datetime::date::text as day,',
      month: `TO_CHAR(journey_start_datetime::DATE, 'yyyy-mm') as month,`,
      all: '',
    };

    const groupBySwitch = {
      day: 'GROUP BY day ORDER BY day ASC',
      month: `GROUP BY TO_CHAR(journey_start_datetime::DATE, 'yyyy-mm')`,
      all: '',
    };

    const values = [...(where ? where.values : [])];
    const text = `
      SELECT
        ${selectSwitch[params.group_by]}
        coalesce(sum(passenger_seats), 0)::int as trip,
        coalesce(sum(journey_distance/1000*passenger_seats), 0)::int as distance,
        (count(distinct driver_id) + count(distinct passenger_id))::int as carpoolers,
        count(distinct operator_id)::int as operators,
        coalesce(trunc(
          (((sum(passenger_seats)::numeric) / count(distinct trip_id))+1), 2
        )::float,0) as average_carpoolers_by_car,
        (count(*) FILTER (
          WHERE (COALESCE(passenger_incentive_rpc_sum, 0) + COALESCE(driver_incentive_rpc_sum, 0)::int > 0)))::int as trip_subsidized,
        coalesce(sum(COALESCE(passenger_incentive_rpc_financial_sum, 0) + COALESCE(driver_incentive_rpc_financial_sum, 0)), 0)::int as financial_incentive_sum,
        coalesce(sum(COALESCE(passenger_incentive_rpc_sum, 0) + COALESCE(driver_incentive_rpc_sum, 0)), 0)::int as incentive_sum
      FROM ${this.table}
      ${where.text ? `WHERE ${where.text}` : ''}
      ${groupBySwitch[params.group_by]}
    `;

    const result = await this.connection.getClient().query({
      values,
      text: this.numberPlaceholders(text),
    });

    return !result.rowCount ? [] : result.rows;
  }

  public async financialStats(params: Partial<TripStatInterface>): Promise<FinancialStatInterface[]> {
    const where = await this.buildWhereClauses(params);

    const values = [...(where ? where.values : [])];
    const groupBy =
      params.group_by === 'day'
        ? {
            format: 'yyyy-mm-dd',
            key: 'day',
          }
        : {
            format: 'yyyy-mm',
            key: 'month',
          };
    const text = `
      SELECT
        to_char(journey_start_datetime::date, '${groupBy.format}') as ${groupBy.key},
        operator_id,
        coalesce(sum(passenger_incentive_rpc_financial_sum + driver_incentive_rpc_financial_sum), 0)::int as financial_incentive_sum,
        coalesce(sum(passenger_incentive_rpc_sum + driver_incentive_rpc_sum), 0)::int as incentive_sum
      FROM ${this.table}
      ${where.text ? `WHERE ${where.text}` : ''}
      GROUP BY ${groupBy.key}, operator_id
      ORDER BY ${groupBy.key} ASC
    `;

    const result = await this.connection.getClient().query({
      values,
      text: this.numberPlaceholders(text),
    });

    return result.rowCount ? result.rows : [];
  }

  public async searchWithCursor(params: TripSearchInterface, type = 'opendata'): Promise<PgCursorHandler> {
    const where = await this.buildWhereClauses(params);
    const queryText = this.numberPlaceholders(`
      SELECT
        ${this.getFields(type).join(', ')}
      FROM ${this.table}
      ${where.text ? `WHERE ${where.text}` : ''}
      ORDER BY journey_start_datetime ASC
    `);

    const db = await this.connection.getClient().connect();
    const cursorCb = db.query(new Cursor(queryText, where.values));

    return {
      read: promisify(cursorCb.read.bind(cursorCb)) as (count: number) => Promise<ExportTripInterface[]>,
      release: db.release,
    };
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
          journey_start_country as start_country,
          journey_end_town as end_town,
          journey_end_country as end_country,
          journey_start_datetime as start_datetime,
          trunc((COALESCE(passenger_incentive_rpc_sum, 0) + COALESCE(driver_incentive_rpc_sum, 0))/100, 2) as incentives,
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

  /**
   * List active operators having trips and incentives > 0
   * in the campaign for the given date range
   */
  public async getPolicyActiveOperators(campaign_id: number, start_date: Date, end_date: Date): Promise<number[]> {
    const result = await this.connection.getClient().query({
      text: `
        select cc.operator_id
        from policy.incentives pi
        join carpool.carpools cc on cc._id = pi.carpool_id
        where
              pi.policy_id = $3
          and pi.amount    >  0
          and cc.datetime >= $1
          and cc.datetime <  $2
          and cc.status   = 'ok'
        group by cc.operator_id
        order by cc.operator_id
      `,
      values: [start_date, end_date, campaign_id],
    });

    return result.rowCount ? result.rows.map((r) => r.operator_id) : [];
  }

  public async getPolicyStats(
    params: CampaignSearchParamsInterface,
    slices: SliceInterface[],
  ): Promise<PolicyStatsInterface> {
    const { start_date, end_date, operator_id, campaign_id } = params;

    // prepare slice filters
    const sliceFilters: string = slices
      .map(({ start, end }, i) => {
        const f = `filter (where amount > 0 and distance >= ${start}${end ? ` and distance < ${end}` : ''})`;
        return `
          (count(distinct acquisition_id) ${f})::int as slice_${i}_count,
          (sum(amount) ${f})::int as slice_${i}_sum,
          ${start} as slice_${i}_start,
          ${end} as slice_${i}_end
        `;
      })
      .join(',');

    // select all trips with a positive incentive calculated by us for a given campaign
    // calculate a global count and incentive sum as well as details for each slice
    const result = await this.connection.getClient().query({
      text: `
        with trips as (
          select
              distinct cc.acquisition_id,
              tl.journey_distance as distance,
              coalesce(pi.amount, 0) as amount
          from policy.incentives pi
          join carpool.carpools cc on cc._id = pi.carpool_id
          join trip.list tl on cc.acquisition_id = tl.journey_id
          where
                cc.datetime >= $1
            and cc.datetime <  $2
            and cc.status = 'ok'
            and cc.operator_id = $3
            and pi.policy_id = $4
        )
        select
          count(distinct acquisition_id)::int as total_count,
          sum(amount)::int as total_sum,
          (count(distinct acquisition_id) filter (where amount > 0))::int as subsidized_count
          ${sliceFilters.length ? `, ${sliceFilters}` : ''}
        from trips
        `,
      values: [start_date, end_date, operator_id, campaign_id],
    });

    // return null results on missing data
    if (!result.rowCount) {
      return {
        total_count: 0,
        total_sum: 0,
        subsidized_count: 0,
        slices: [],
      };
    }

    // rearrange the return object
    const row = result.rows[0];
    return Object.keys(row).reduce(
      (p, k) => {
        if (!k.includes('slice_')) return p;
        const [, i, prop] = k.split('_');
        if (prop === 'start' || prop === 'end') {
          set(p, `slices.${i}.slice.${prop}`, row[k]);
        } else {
          set(p, `slices.${i}.${prop}`, row[k]);
        }
        return p;
      },
      {
        total_count: row.total_count,
        total_sum: row.total_sum,
        subsidized_count: row.subsidized_count,
        slices: [],
      },
    );
  }

  public async getPolicyCursor(params: CampaignSearchParamsInterface, type = 'opendata'): Promise<PgCursorHandler> {
    const { start_date, end_date, operator_id, campaign_id } = params;

    const queryText = `
      with trips as (
        select distinct cc.acquisition_id as journey_id
        from policy.incentives pi
        join carpool.carpools cc on cc._id = pi.carpool_id
        where
              cc.datetime >= $1
          and cc.datetime <  $2
          and cc.status = 'ok'
          and cc.operator_id = $3
          and pi.policy_id = $4
          and pi.amount > 0
        )
        select ${this.getFields(type).join(', ')}
        from trip.list
        where journey_id in (select journey_id from trips)
        order by journey_start_datetime asc
    `;

    const db = await this.connection.getClient().connect();
    const cursorCb = db.query(new Cursor(queryText, [start_date, end_date, operator_id, campaign_id]));

    return {
      read: promisify(cursorCb.read.bind(cursorCb)) as (count: number) => Promise<ExportTripInterface[]>,
      release: db.release,
    };
  }

  private getFields(type = 'opendata'): string[] {
    // all
    const baseFields = [
      'journey_id',
      'trip_id',
      'journey_start_datetime',
      'journey_start_lon',
      'journey_start_lat',
      'journey_start_insee',
      'journey_start_department',
      'journey_start_town',
      'journey_start_towngroup',
      'journey_start_country',
      'journey_end_datetime',
      'journey_end_lon',
      'journey_end_lat',
      'journey_end_insee',
      'journey_end_department',
      'journey_end_town',
      'journey_end_towngroup',
      'journey_end_country',
      'driver_card',
      'passenger_card',
      'passenger_over_18',
      'passenger_seats',
      'operator_class',
      'operator_journey_id',
      'operator_passenger_id',
      'operator_driver_id',
      'journey_distance',
      'journey_duration',
      'journey_distance_anounced',
      'journey_distance_calculated',
      'journey_duration_anounced',
      'journey_duration_calculated',
      'passenger_incentive_rpc_raw::json[]',
      'driver_incentive_rpc_raw::json[]',
      'passenger_incentive_raw::json[]',
      'driver_incentive_raw::json[]',
    ];

    // all except opendata
    const financialFields = ['passenger_id', 'passenger_contribution', 'driver_id', 'driver_revenue'];

    let selectedFields = [...baseFields];
    switch (type) {
      case 'territory':
      case 'registry':
        selectedFields = [...selectedFields, 'operator', ...financialFields, 'status'];
        break;
      case 'operator':
        selectedFields = [...selectedFields, ...financialFields, 'status'];
        break;
    }

    return selectedFields;
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
