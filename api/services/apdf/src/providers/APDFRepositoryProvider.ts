/* eslint-disable max-len */
import { provider } from '@ilos/common';
import { Cursor, PostgresConnection } from '@ilos/connection-postgres';
import { set } from 'lodash';
import { promisify } from 'util';
import {
  CampaignSearchParamsInterface,
  DataRepositoryInterface,
  DataRepositoryProviderInterfaceResolver,
} from '../interfaces/APDFRepositoryProviderInterface';
import { APDFTripInterface } from '../interfaces/APDFTripInterface';
import { PolicyStatsInterface } from '../shared/apdf/interfaces/PolicySliceStatInterface';
import { PgCursorHandler } from '../shared/common/PromisifiedPgCursor';
import { SliceInterface } from '../shared/policy/common/interfaces/SliceInterface';

@provider({ identifier: DataRepositoryProviderInterfaceResolver })
export class DataRepositoryProvider implements DataRepositoryInterface {
  public static readonly MAX_DISTANCE_METERS = 150_000;

  constructor(public connection: PostgresConnection) {}

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

  /**
   * Compile stats on carpools applying slices
   */
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
    const query = {
      text: `
        with trips as (
          select
              distinct cc.acquisition_id,
              cc.distance,
              coalesce(pi.amount, 0) as amount
          from policy.incentives pi
          join carpool.carpools cc on cc._id = pi.carpool_id
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
    };

    const result = await this.connection.getClient().query(query);

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

  /**
   * List all carpools for CSV APDF export using a cursor
   */
  public async getPolicyCursor(params: CampaignSearchParamsInterface): Promise<PgCursorHandler<APDFTripInterface>> {
    const { start_date, end_date, operator_id, campaign_id } = params;

    const queryText = `
      with ccd as (
        select
          _id,
          identity_id,
          datetime,
          trip_id,
          acquisition_id,
          operator_trip_id,
          operator_journey_id,
          distance,
          duration,
          operator_class
        from carpool.carpools
        where
          datetime >= $1
          and datetime < $2
          and status = 'ok'
          and operator_id = $3
          and is_driver = true
      )
      -- list in api/services/trip/src/actions/excel/BuildExcel.ts
      select
        ccd.operator_journey_id as journey_id,
        ccd.trip_id,
        ccd.operator_trip_id,
    
        -- driver
        cid.uuid as driver_uuid,
        cid.operator_user_id as operator_driver_id,
        pid.amount as driver_rpc_incentive,
    
        -- passenger
        cip.uuid as passenger_uuid,
        cip.operator_user_id as operator_passenger_id,
        pip.amount as passenger_rpc_incentive,
        -- ccd.seats as passenger_seats,
        -- cip.over_18 as passenger_over_18,

        ccd.datetime as start_datetime,
        ccd.datetime + (ccd.duration || ' seconds')::interval as end_datetime,
        gps.l_arr as start_location,
        gps.arr as start_insee,
        gpe.l_arr as end_location,
        gpe.arr as end_insee,
        ccd.duration,
        ccd.distance,
        ccd.operator_class

      from ccd
      left join carpool.carpools ccp on ccd.acquisition_id = ccp.acquisition_id and ccp.is_driver = false
      left join carpool.identities cid on cid._id = ccd.identity_id
      left join carpool.identities cip on cip._id = ccp.identity_id
      left join policy.incentives pid on ccd._id = pid.carpool_id and pid.policy_id = $4 and pid.status = 'validated'
      left join policy.incentives pip on ccp._id = pip.carpool_id and pip.policy_id = $4 and pid.status = 'validated'
      left join geo.perimeters gps on ccp.start_geo_code = gps.arr and gps.year = geo.get_latest_millesime_or(extract(year from ccp.datetime)::smallint)
      left join geo.perimeters gpe on ccp.end_geo_code = gpe.arr and gpe.year = geo.get_latest_millesime_or(extract(year from (ccp.datetime + (ccd.duration || ' seconds')::interval))::smallint)

      where pid.policy_id is not null or pip.policy_id is not null

      order by ccd.datetime
    `;

    const db = await this.connection.getClient().connect();
    const cursorCb = db.query(new Cursor(queryText, [start_date, end_date, operator_id, campaign_id]));

    return {
      read: promisify(cursorCb.read.bind(cursorCb)) as (count: number) => Promise<APDFTripInterface[]>,
      release: db.release,
    };
  }
}
