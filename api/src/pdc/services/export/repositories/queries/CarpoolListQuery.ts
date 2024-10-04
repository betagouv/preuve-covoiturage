/* eslint-disable max-len */
import {
  CarpoolAcquisitionStatusEnum,
  CarpoolAnomalyStatusEnum,
  CarpoolFraudStatusEnum,
} from "@/pdc/providers/carpool/interfaces/common.ts";
import { AbstractQuery } from "./AbstractQuery.ts";

// List the {{template}} used in the query for string replacement
export type TemplateKeys = "geo_selectors" | "operator_id";

export type CarpoolListType = {
  journey_id: number;
  operator_trip_id: string;
  operator_journey_id: string;
  operator_class: string;
  acquisition_status: CarpoolAcquisitionStatusEnum;
  fraud_status: CarpoolFraudStatusEnum;
  anomaly_status: CarpoolAnomalyStatusEnum;

  start_datetime: Date;
  start_date: string;
  start_time: string;
  end_datetime: Date;
  end_date: string;
  end_time: string;
  duration: number;
  distance: number;

  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;

  start_insee: string;
  start_commune: string;
  start_departement: string;
  start_epci: string;
  start_aom: string;
  start_region: string;
  start_pays: string;

  end_insee: string;
  end_commune: string;
  end_departement: string;
  end_epci: string;
  end_aom: string;
  end_region: string;
  end_pays: string;

  operator: string;
  operator_passenger_id: string;
  passenger_identity_key: string;
  operator_driver_id: string;
  driver_identity_key: string;

  driver_revenue: number;
  passenger_contribution: number;
  passenger_seats: number;

  cee_application: boolean;

  // incentives
  incentive_0_siret: string;
  incentive_0_name: string;
  incentive_0_amount: number;

  incentive_1_siret: string;
  incentive_1_name: string;
  incentive_1_amount: number;

  incentive_2_siret: string;
  incentive_2_name: string;
  incentive_2_amount: number;

  // RPC incentives
  incentive_rpc_0_campaign_id: number;
  incentive_rpc_0_campaign_name: number;
  incentive_rpc_0_siret: string;
  incentive_rpc_0_name: string;
  incentive_rpc_0_amount: number;

  incentive_rpc_1_campaign_id: number;
  incentive_rpc_1_campaign_name: number;
  incentive_rpc_1_siret: string;
  incentive_rpc_1_name: string;
  incentive_rpc_1_amount: number;

  incentive_rpc_2_campaign_id: number;
  incentive_rpc_2_campaign_name: number;
  incentive_rpc_2_siret: string;
  incentive_rpc_2_name: string;
  incentive_rpc_2_amount: number;

  // Offer
  offer_public: boolean;
  offer_accepted_at: Date;
};

export class CarpoolListQuery extends AbstractQuery {
  protected countQuery = `
    SELECT count(cc.*) as count
    FROM carpool_v2.carpools cc

    LEFT JOIN carpool_v2.status cs ON cc._id = cs.carpool_id

    -- geo selection
    LEFT JOIN carpool_v2.geo cg ON cc._id = cg.carpool_id
    LEFT JOIN geo.perimeters gps ON cg.start_geo_code = gps.arr AND gps.year = $3::smallint
    LEFT JOIN geo.perimeters gpe ON cg.end_geo_code = gpe.arr AND gpe.year = $3::smallint

    WHERE true
      AND cc.start_datetime >= $1
      AND cc.start_datetime <  $2
      AND cs.acquisition_status = 'processed'
      {{geo_selectors}}
      {{operator_id}}
  `;

  protected query = `
    WITH trips AS (
      SELECT
        cc._id,
        cc.legacy_id,
        cs.acquisition_status,
        cs.fraud_status,
        cs.anomaly_status,

        -- time
        cc.start_datetime as start_at,
        cc.end_datetime as end_at,
        cc.end_datetime - cc.start_datetime as duration,

        -- distance
        cc.distance,
        ST_Y(cc.start_position::geometry) as start_lat,
        ST_X(cc.start_position::geometry) as start_lon,
        ST_Y(cc.end_position::geometry) as end_lat,
        ST_X(cc.end_position::geometry) as end_lon,

        -- administration
        cg.start_geo_code,
        cg.end_geo_code,

        -- operator data
        cc.operator_class,
        oo.name as operator,
        cc.operator_trip_id,
        cc.operator_journey_id,
        cc.passenger_operator_user_id as operator_passenger_id,
        cc.passenger_identity_key,
        cc.driver_operator_user_id as operator_driver_id,
        cc.driver_identity_key,

        -- money, money, money
        cc.passenger_contribution::float / 100 as passenger_contribution,
        cc.driver_revenue::float / 100 as driver_revenue,
        cc.passenger_seats,

        -- an array of json objects with the incentives
        -- to be split in numbered columns by the sql to csv exporter
        -- (limit to 4 records)
        jsonb_path_query_array(agg_incentives.incentive::jsonb, '$[0 to 3]') as incentive,

        -- same for RPC calculated incentives (limit to 4 records)
        jsonb_path_query_array(agg_incentives_rpc.incentive_rpc::jsonb, '$[0 to 3]') as incentive_rpc,

        -- CEE application data
        cee._id IS NOT NULL as cee_application

      FROM carpool_v2.carpools cc

      -- join the carpool tables
      LEFT JOIN carpool_v2.status cs ON cc._id = cs.carpool_id
      LEFT JOIN carpool_v2.geo cg ON cc._id = cg.carpool_id

      -- get operator data
      LEFT JOIN operator.operators oo ON cc.operator_id = oo._id

      -- get CEE applications data
      LEFT JOIN cee.cee_applications cee ON cc._id = cee.carpool_id

      -- get incentive from carpool_v2.operator_incentives
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
          -- 'index', ci.idx,
          'siret', ci.siret,
          'name', ccp.legal_name,
          'amount', ci.amount::float / 100
        ) ORDER BY ci.idx) as incentive
        FROM carpool_v2.operator_incentives ci
        LEFT JOIN company.companies ccp ON ci.siret = ccp.siret
        WHERE ci.carpool_id = cc._id
      ) as agg_incentives ON TRUE

      -- get RPC incentives from policy.incentives
      LEFT JOIN LATERAL (
        SELECT json_agg(json_build_object(
          'campaign_id', pp._id,
          'campaign_name', pp.name,
          'siret', ccp.siret,
          'name', ttg.name,
          'amount', pi_rpc.amount::float / 100
        )) as incentive_rpc
        FROM policy.incentives pi_rpc
        LEFT JOIN policy.policies pp ON pi_rpc.policy_id = pp._id
        LEFT JOIN territory.territory_group ttg ON pp.territory_id = ttg._id
        LEFT JOIN company.companies ccp ON ttg.company_id = ccp._id
        WHERE pi_rpc.operator_id = cc.operator_id
          AND pi_rpc.operator_journey_id = cc.operator_journey_id
      ) as agg_incentives_rpc ON TRUE

      -- geo selection
      LEFT JOIN geo.perimeters gps ON cg.start_geo_code = gps.arr AND gps.year = $3::smallint
      LEFT JOIN geo.perimeters gpe ON cg.end_geo_code = gpe.arr AND gpe.year = $3::smallint

      WHERE true
        AND cc.start_datetime >= $1
        AND cc.start_datetime <  $2
        AND cs.acquisition_status = 'processed'
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
      trips.legacy_id as journey_id,
      trips.operator_trip_id,
      trips.operator_journey_id,
      trips.operator_class,
      trips.acquisition_status,
      trips.fraud_status,
      trips.anomaly_status,

      -- dates and times are in UTC
      -- ceil times to 10 minutes and format for user's convenience
      ts_ceil(trips.start_at at time zone 'Europe/Paris', 600) as start_datetime,
      to_char(ts_ceil(trips.start_at at time zone 'Europe/Paris', 600), 'YYYY-MM-DD') as start_date,
      to_char(ts_ceil(trips.start_at at time zone 'Europe/Paris', 600), 'HH24:MI:SS') as start_time,
      ts_ceil(trips.end_at at time zone 'Europe/Paris', 600) as end_datetime,
      to_char(ts_ceil(trips.end_at at time zone 'Europe/Paris', 600), 'YYYY-MM-DD') as end_date,
      to_char(ts_ceil(trips.end_at at time zone 'Europe/Paris', 600), 'HH24:MI:SS') as end_time,
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
      trips.passenger_seats,

      -- CEE application data
      trips.cee_application,

      -- incentives
      trips.incentive[0]->>'siret' as incentive_0_siret,
      trips.incentive[0]->>'name' as incentive_0_name,
      trips.incentive[0]->>'amount' as incentive_0_amount,

      trips.incentive[1]->>'siret' as incentive_1_siret,
      trips.incentive[1]->>'name' as incentive_1_name,
      trips.incentive[1]->>'amount' as incentive_1_amount,

      trips.incentive[2]->>'siret' as incentive_2_siret,
      trips.incentive[2]->>'name' as incentive_2_name,
      trips.incentive[2]->>'amount' as incentive_2_amount,

      -- RPC incentives
      trips.incentive_rpc[0]->>'campaign_id' as incentive_rpc_0_campaign_id,
      trips.incentive_rpc[0]->>'campaign_name' as incentive_rpc_0_campaign_name,
      trips.incentive_rpc[0]->>'siret' as incentive_rpc_0_siret,
      trips.incentive_rpc[0]->>'name' as incentive_rpc_0_name,
      trips.incentive_rpc[0]->>'amount' as incentive_rpc_0_amount,

      trips.incentive_rpc[1]->>'campaign_id' as incentive_rpc_1_campaign_id,
      trips.incentive_rpc[1]->>'campaign_name' as incentive_rpc_1_campaign_name,
      trips.incentive_rpc[1]->>'siret' as incentive_rpc_1_siret,
      trips.incentive_rpc[1]->>'name' as incentive_rpc_1_name,
      trips.incentive_rpc[1]->>'amount' as incentive_rpc_1_amount,

      trips.incentive_rpc[2]->>'campaign_id' as incentive_rpc_2_campaign_id,
      trips.incentive_rpc[2]->>'campaign_name' as incentive_rpc_2_campaign_name,
      trips.incentive_rpc[2]->>'siret' as incentive_rpc_2_siret,
      trips.incentive_rpc[2]->>'name' as incentive_rpc_2_name,
      trips.incentive_rpc[2]->>'amount' as incentive_rpc_2_amount,

      -- offer data (to be completed)
      true as offer_public, -- TODO
      trips.start_at as offer_accepted_at -- TODO

    FROM trips
    LEFT JOIN geo AS gps ON trips.start_geo_code = gps.arr
    LEFT JOIN geo AS gpe ON trips.end_geo_code = gpe.arr
    ORDER BY start_datetime ASC
  `;
}
