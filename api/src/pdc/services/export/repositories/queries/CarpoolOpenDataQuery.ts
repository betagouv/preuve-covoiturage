import sql, { Sql } from "@/lib/pg/sql.ts";
import { CarpoolAcquisitionStatusEnum } from "@/pdc/providers/carpool/interfaces/common.ts";
import { ExportParams } from "@/pdc/services/export/models/ExportParams.ts";
import { IncentiveStatusEnum } from "@/pdc/services/policy/interfaces/index.ts";

export type CarpoolOpenDataListType = {
  journey_id: number;
  trip_id: string;

  journey_start_datetime: Date;
  journey_start_date: string;
  journey_start_time: string;
  journey_start_lon: number;
  journey_start_lat: number;
  journey_start_insee: string;
  journey_start_department: string;
  journey_start_town: string;
  journey_start_towngroup: string;
  journey_start_country: string;

  journey_end_datetime: Date;
  journey_end_date: string;
  journey_end_time: string;
  journey_end_lon: number;
  journey_end_lat: number;
  journey_end_insee: string;
  journey_end_department: string;
  journey_end_town: string;
  journey_end_towngroup: string;
  journey_end_country: string;

  passenger_seats: number;
  operator_class: string;
  journey_distance: number;
  journey_duration: number;
  has_incentive: boolean;
};

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
        cc.operator_trip_id AS trip_id,
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
        dep,
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
      trips.journey_id,

      -- generate a random trip_id if not provided
      -- the data MUST be hashed to avoid re-identification
      COALESCE(trips.trip_id::text, uuid_generate_v4()::text) as trip_id,

      -- start
      -- journey_start_datetime is exported in UTC and converted by JS to the proper format
      ts_ceil(trips.start_datetime, 600) as journey_start_datetime,
      to_char(ts_ceil(trips.start_datetime at time zone ${tz}, 600), 'YYYY-MM-DD') as journey_start_date,
      to_char(ts_ceil(trips.start_datetime at time zone ${tz}, 600), 'HH24:MI:SS') as journey_start_time,
      trunc(trips.start_lon::numeric, gps.precision) as journey_start_lon,
      trunc(trips.start_lat::numeric, gps.precision) as journey_start_lat,
      gps.arr as journey_start_insee,
      gps.dep as journey_start_department,
      gps.l_arr as journey_start_town,
      gps.l_epci as journey_start_towngroup,
      gps.l_country as journey_start_country,

      -- end
      -- journey_end_datetime is exported in UTC and converted by JS to the proper format
      ts_ceil(trips.end_datetime, 600) as journey_end_datetime,
      to_char(ts_ceil(trips.end_datetime at time zone ${tz}, 600), 'YYYY-MM-DD') as journey_end_date,
      to_char(ts_ceil(trips.end_datetime at time zone ${tz}, 600), 'HH24:MI:SS') as journey_end_time,
      trunc(trips.end_lon::numeric, gpe.precision) as journey_end_lon,
      trunc(trips.end_lat::numeric, gpe.precision) as journey_end_lat,
      gpe.arr as journey_end_insee,
      gpe.dep as journey_end_department,
      gpe.l_arr as journey_end_town,
      gpe.l_epci as journey_end_towngroup,
      gpe.l_country journey_end_country,

      trips.passenger_seats,
      trips.operator_class,
      trips.distance AS journey_distance,
      ROUND(EXTRACT(EPOCH FROM trips.end_datetime - trips.start_datetime) / 60) AS journey_duration,

      i.operator_id IS NOT NULL AS has_incentive

    FROM trips
    LEFT JOIN geo AS gps ON trips.start_geo_code = gps.arr
    LEFT JOIN geo AS gpe ON trips.end_geo_code = gpe.arr
    LEFT JOIN incentives i ON trips.operator_id = i.operator_id AND trips.operator_journey_id = i.operator_journey_id AND i.idx = 1
    ORDER BY trips.start_datetime ASC
  `;
}
