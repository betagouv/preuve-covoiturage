/* eslint-disable max-len */
import { Query } from './Query';

export type TemplateKeys = 'geo_selectors' | 'operator_id';

export class CarpoolListQuery extends Query {
  protected countQuery = `
    SELECT count(*) as count
    FROM carpool.carpools cc

    -- geo selection
    LEFT JOIN geo.perimeters gps ON cc.start_geo_code = gps.arr AND gps.year = $3::smallint
    LEFT JOIN geo.perimeters gpe ON cc.end_geo_code = gpe.arr AND gpe.year = $3::smallint

    WHERE cc.is_driver = false
      AND cc.datetime >= $1
      AND cc.datetime <  $2
      {{geo_selectors}}
      {{operator_id}}
  `;

  protected query = `
    WITH trips AS (
      SELECT
        cc.acquisition_id,
        cc.trip_id,
        cc.status as status,

        -- time
        cc.datetime as start_at,
        cc.datetime + (cc.duration::text || ' seconds')::interval as end_at,
        (cc.duration::text || ' seconds')::interval as duration,

        -- distance
        cc.distance,
        ST_Y(cc.start_position::geometry) as start_lat,
        ST_X(cc.start_position::geometry) as start_lon,
        ST_Y(cc.end_position::geometry) as end_lat,
        ST_X(cc.end_position::geometry) as end_lon,

        -- administration
        cc.start_geo_code,
        cc.end_geo_code,

        -- operator data
        cc.operator_class,
        oo.name as operator,
        cc.operator_journey_id,
        id_p.operator_user_id as operator_passenger_id,
        id_p.identity_key as passenger_identity_key,
        id_d.operator_user_id as operator_driver_id,
        id_d.identity_key as driver_identity_key,

        -- root carpool is from the passenger
        cc.cost as passenger_contribution,
        cc_driver.cost as driver_revenue,

        -- an array of json objects with the incentives
        -- to be split in numbered columns by the sql to csv exporter
        -- (limit to 4 records)
        jsonb_path_query_array(agg_incentives.incentive::jsonb, '$[0 to 3]') as incentive,

        -- same for RPC calculated incentives (limit to 4 records)
        jsonb_path_query_array(agg_incentives_rpc.incentive_rpc::jsonb, '$[0 to 3]') as incentive_rpc,

        -- campaigns
        pi.campaigns,

        -- CEE application data
        cee._id IS NOT NULL as demande_cee

      FROM carpool.carpools cc

      -- join the driver's carpool
      LEFT JOIN carpool.carpools cc_driver ON cc.acquisition_id = cc_driver.acquisition_id AND cc_driver.is_driver = TRUE

      -- get operator data
      LEFT JOIN operator.operators oo ON cc.operator_id = oo._id

      -- get CEE applications data
      LEFT JOIN cee.cee_applications cee ON cc_driver._id = cee.carpool_id

      -- get incentive from carpool.incentives
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
          'index', ci.idx,
          'siret', ci.siret,
          'amount', ci.amount
        ) ORDER BY ci.idx) as incentive
        FROM carpool.incentives ci
        WHERE ci.acquisition_id = cc.acquisition_id
      ) as agg_incentives ON TRUE

      -- get RPC incentives from policy.incentives
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
          'campaign_id', pi_rpc.policy_id,
          'amount', pi_rpc.amount
        )) as incentive_rpc
        FROM policy.incentives pi_rpc
        WHERE pi_rpc.carpool_id = cc_driver._id
      ) as agg_incentives_rpc ON TRUE

      -- identities
      LEFT JOIN carpool.identities id_p ON cc.identity_id = id_p._id
      LEFT JOIN carpool.identities id_d ON cc_driver.identity_id = id_d._id

      -- geo selection
      LEFT JOIN geo.perimeters gps ON cc.start_geo_code = gps.arr AND gps.year = $3::smallint
      LEFT JOIN geo.perimeters gpe ON cc.end_geo_code = gpe.arr AND gpe.year = $3::smallint

      -- campaigns can be many on one carpool
      LEFT JOIN LATERAL (
        SELECT array_agg(policy_id) as campaigns
        FROM policy.incentives
        WHERE carpool_id = cc_driver._id
      ) AS pi ON TRUE

      -- target the passenger for the root carpools
      WHERE cc.is_driver = false
        AND cc.datetime >= $1
        AND cc.datetime <  $2
        {{geo_selectors}}
        {{operator_id}}
    ),

    -- select latest geo data for start and end geo codes only
    -- move country code and name in their own columns
    geo AS (
      SELECT DISTINCT ON (arr)
        arr,
        CASE WHEN arr <> country THEN l_arr ELSE null END AS l_arr,
        l_com,
        l_epci,
        l_dep,
        l_reg,
        CASE WHEN arr <> country THEN l_country ELSE l_arr END AS l_country,
        l_aom,
        CASE
          WHEN surface > 0::double precision AND (pop::double precision / (surface::double precision / 100::double precision)) > 40::double precision THEN 3
          ELSE 2
        END as precision
      FROM geo.perimeters
      WHERE arr IN (SELECT UNNEST(ARRAY[start_geo_code, end_geo_code]) FROM trips)
      ORDER BY arr, year DESC
    )

    -- fields to export
    SELECT
      -- general trip identifiers
      trips.trip_id,
      trips.operator_journey_id,
      trips.operator_class,
      trips.status,

      -- dates and times are in UTC
      -- ceil times to 10 minutes and format for user's convenience
      ts_ceil(trips.start_at, 600) as start_datetime_utc,
      to_char(ts_ceil(trips.start_at, 600), 'YYYY-MM-DD') as start_date_utc,
      to_char(ts_ceil(trips.start_at, 600), 'HH24:MI:SS') as start_time_utc,
      ts_ceil(trips.end_at, 600) as end_datetime_utc,
      to_char(ts_ceil(trips.end_at, 600), 'YYYY-MM-DD') as end_date_utc,
      to_char(ts_ceil(trips.end_at, 600), 'HH24:MI:SS') as end_time_utc,
      to_char(trips.duration, 'HH24:MI:SS') as duration,

      -- distance in km with meter precision (float)
      trips.distance::float / 1000 as distance,

      -- truncate position depending on population density
      trunc(trips.start_lat::numeric, gps.precision) as start_lat,
      trunc(trips.start_lon::numeric, gps.precision) as start_lon,
      trunc(trips.end_lat::numeric, gpe.precision) as end_lat,
      trunc(trips.end_lon::numeric, gpe.precision) as end_lon,

      -- administrative data
      gps.arr as start_insee,
      gps.l_arr as start_commune,
      gps.l_dep as start_departement,
      gps.l_epci as start_epci,
      gps.l_aom as start_aom,
      gps.l_reg as start_region,
      gps.l_country as start_pays,
      gpe.arr as end_insee,
      gpe.l_arr as end_commune,
      gpe.l_dep as end_departement,
      gpe.l_epci as end_epci,
      gpe.l_aom as end_aom,
      gpe.l_reg as end_region,
      gpe.l_country as end_pays,

      -- operator data
      trips.operator,
      trips.operator_passenger_id,
      trips.passenger_identity_key,
      trips.operator_driver_id,
      trips.driver_identity_key,

      -- financial data
      trips.driver_revenue,
      trips.passenger_contribution,

      -- CEE application data
      trips.demande_cee,

      -- campaigns (for computation)
      trips.campaigns,

      -- incentives
      trips.incentive[0]->>'index' as incentive_0_index,
      trips.incentive[0]->>'siret' as incentive_0_siret,
      trips.incentive[0]->>'amount' as incentive_0_amount,
      trips.incentive[1]->>'index' as incentive_1_index,
      trips.incentive[1]->>'siret' as incentive_1_siret,
      trips.incentive[1]->>'amount' as incentive_1_amount,
      trips.incentive[2]->>'index' as incentive_2_index,
      trips.incentive[2]->>'siret' as incentive_2_siret,
      trips.incentive[2]->>'amount' as incentive_2_amount,

      -- RPC incentives
      trips.incentive_rpc[0]->>'campaign_id' as incentive_rpc_0_campaign_id,
      trips.incentive_rpc[0]->>'amount' as incentive_rpc_0_amount,
      trips.incentive_rpc[1]->>'campaign_id' as incentive_rpc_1_campaign_id,
      trips.incentive_rpc[1]->>'amount' as incentive_rpc_1_amount,
      trips.incentive_rpc[2]->>'campaign_id' as incentive_rpc_2_campaign_id,
      trips.incentive_rpc[2]->>'amount' as incentive_rpc_2_amount,

      -- offer data (to be completed)
      true as offer_public,
      trips.start_at as offer_accepted_at -- TODO

    FROM trips
    LEFT JOIN geo AS gps ON trips.start_geo_code = gps.arr
    LEFT JOIN geo AS gpe ON trips.end_geo_code = gpe.arr
    ORDER BY 5 ASC
  `;
}
