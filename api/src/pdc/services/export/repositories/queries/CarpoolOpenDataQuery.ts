import sql, { Sql } from "@/pdc/providers/carpool/helpers/sql.ts";
import { CarpoolAcquisitionStatusEnum } from "@/pdc/providers/carpool/interfaces/common.ts";
import { ExportParams } from "@/pdc/services/export/models/ExportParams.ts";
import { IncentiveStatusEnum } from "@/pdc/services/policy/interfaces/index.ts";

export function CarpoolOpenDataQuery(params: ExportParams): Sql {
  const { start_at, end_at, tz } = params.get();
  const min_occurrences = 6;
  const acquisition_status = CarpoolAcquisitionStatusEnum.Processed;
  const incentive_status = IncentiveStatusEnum.Validated;

  return sql`
    WITH

    -- fetch the carpool_id of the carpools that have
    -- less than min_occurrences start or end geo codes
    exclude_start_full AS (
      SELECT cg.start_geo_code, array_agg(cc._id) as _id
      FROM carpool_v2.carpools cc
      JOIN carpool_v2.status cs ON cc._id = cs.carpool_id
      JOIN carpool_v2.geo cg ON cc._id = cg.carpool_id
      WHERE true
        AND cc.start_datetime >= ${start_at}
        AND cc.start_datetime  < ${end_at}
        AND cs.acquisition_status = ${acquisition_status}
      GROUP BY 1
      HAVING COUNT(cg.start_geo_code) < ${min_occurrences}
    ),
    exclude_end_full AS (
      SELECT cg.end_geo_code, array_agg(cc._id) AS _id
      FROM carpool_v2.carpools cc
      JOIN carpool_v2.status cs ON cc._id = cs.carpool_id
      JOIN carpool_v2.geo cg ON cc._id = cg.carpool_id
      WHERE true
        AND cc.start_datetime >= ${start_at}
        AND cc.start_datetime  < ${end_at}
        AND cs.acquisition_status = ${acquisition_status}
      GROUP BY 1
      HAVING COUNT(cg.end_geo_code) < ${min_occurrences}
    ),

    -- consolidate the carpool_id to exclude
    exclude_id AS (
      SELECT UNNEST(_id) AS _id FROM exclude_start_full GROUP BY 1
      UNION ALL
      SELECT UNNEST(_id) AS _id FROM exclude_end_full GROUP BY 1
    ),

    -- select carpools and exclude the ones from exclude_id
    trips AS (
      SELECT
        cc.legacy_id AS journey_id,
        cc.operator_class,
        cc.start_datetime,
        cc.end_datetime,
        cc.distance,
        ST_Y(cc.start_position::geometry) as start_lat,
        ST_X(cc.start_position::geometry) as start_lon,
        ST_Y(cc.end_position::geometry) as end_lat,
        ST_X(cc.end_position::geometry) as end_lon,
        cg.start_geo_code,
        cg.end_geo_code,
        cc.passenger_seats,

        cc.operator_id,
        cc.operator_journey_id

      FROM carpool_v2.carpools cc
      JOIN carpool_v2.status cs ON cc._id = cs.carpool_id
      JOIN carpool_v2.geo cg ON cc._id = cg.carpool_id

      WHERE true
        AND cc.start_datetime >= ${start_at}
        AND cc.start_datetime  < ${end_at}
        AND cs.acquisition_status = ${acquisition_status}

        -- exclude carpools with less than min_occurrences start or end geo codes
        AND cc._id NOT IN (SELECT _id FROM exclude_id)

      ORDER BY cc.start_datetime
    ),

    -- select the first incentives for each trip
    incentives AS (
      SELECT
        pi.operator_id,
        pi.operator_journey_id,
        ROW_NUMBER() OVER (PARTITION BY pi.operator_id, pi.operator_journey_id ORDER BY pi.amount DESC) as idx
      FROM policy.incentives pi
      JOIN trips ON trips.operator_id = pi.operator_id AND trips.operator_journey_id = pi.operator_journey_id
      WHERE pi.status = ${incentive_status}
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

    -- organise the data for opendata export
    SELECT
      journey_id,
      trips.operator_class,

      to_char(ts_ceil(trips.start_datetime at time zone ${tz}, 600), 'YYYY-MM-DD HH24:MI:SS') as start_datetime,
      to_char(ts_ceil(trips.start_datetime at time zone ${tz}, 600), 'YYYY-MM-DD') as start_date,
      to_char(ts_ceil(trips.start_datetime at time zone ${tz}, 600), 'HH24:MI:SS') as start_time,
      to_char(ts_ceil(trips.end_datetime at time zone ${tz}, 600), 'YYYY-MM-DD HH24:MI:SS') as end_datetime,
      to_char(ts_ceil(trips.end_datetime at time zone ${tz}, 600), 'YYYY-MM-DD') as end_date,
      to_char(ts_ceil(trips.end_datetime at time zone ${tz}, 600), 'HH24:MI:SS') as end_time,

      to_char(trips.end_datetime - trips.start_datetime, 'HH24:MI:SS') as duration,
      trips.distance,

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

      trips.passenger_seats,
      i.operator_id IS NOT NULL AS has_incentive

    FROM trips
    LEFT JOIN geo AS gps ON trips.start_geo_code = gps.arr
    LEFT JOIN geo AS gpe ON trips.end_geo_code = gpe.arr
    LEFT JOIN incentives i ON trips.operator_id = i.operator_id AND trips.operator_journey_id = i.operator_journey_id AND i.idx = 1
    ORDER BY trips.start_datetime ASC
  `;
}
